#!/usr/bin/env bash
# 生产启动脚本 首次运行自动安装环境与依赖并构建 再次运行只重启服务
set -uo pipefail

cd "$(dirname "$0")" || exit 1
ROOT=$(pwd -P)

PORT=${PORT:-3000}
HOST=${HOST:-0.0.0.0}
PID_DIR=pid
LOG_DIR=nohup_log
PID_FILE="$PID_DIR/forum.pid"
STAMP=$(date +%Y%m%d_%H%M%S)
APP_LOG="$LOG_DIR/app_$STAMP.log"
TASK_LOG="$LOG_DIR/task_$STAMP.log"

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
die() { log "错误 $*"; exit 1; }

# 以 root 身份执行命令 没有权限时返回失败
as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    return 1
  fi
}

# 安装 Node 22 LTS 需要 root 权限与 curl
install_node() {
  log "未找到 Node.js 开始安装 22 LTS"
  command -v curl >/dev/null 2>&1 || die "缺少 curl 无法自动安装 Node.js"
  if command -v apt-get >/dev/null 2>&1; then
    as_root bash -c 'curl -fsSL https://deb.nodesource.com/setup_22.x | bash -' || die "添加 NodeSource 源失败"
    as_root apt-get install -y nodejs || die "安装 Node.js 失败"
  elif command -v dnf >/dev/null 2>&1; then
    as_root bash -c 'curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -' || die "添加 NodeSource 源失败"
    as_root dnf install -y nodejs || die "安装 Node.js 失败"
  elif command -v yum >/dev/null 2>&1; then
    as_root bash -c 'curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -' || die "添加 NodeSource 源失败"
    as_root yum install -y nodejs || die "安装 Node.js 失败"
  else
    die "无法识别包管理器 请手动安装 Node.js 20.9 以上版本"
  fi
}

# 判断 Node 版本是否满足 20.9 以上
node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  local major minor
  major=$(node -p 'process.versions.node.split(".")[0]')
  minor=$(node -p 'process.versions.node.split(".")[1]')
  [ "$major" -gt 20 ] && return 0
  [ "$major" -eq 20 ] && [ "$minor" -ge 9 ] && return 0
  return 1
}

# 精确结束旧进程 先核对工作目录与命令行 避免误杀
stop_old() {
  [ -f "$PID_FILE" ] || return 0
  local old cwd cmd
  old=$(cat "$PID_FILE")
  if kill -0 "$old" 2>/dev/null; then
    cwd=$(readlink "/proc/$old/cwd" 2>/dev/null)
    cmd=$(tr '\0' ' ' < "/proc/$old/cmdline" 2>/dev/null)
    if [ "$cwd" != "$ROOT" ] || [[ "$cmd" != *next* ]]; then
      die "PID $old 不属于本项目 工作目录 $cwd 已中止 请手动处理"
    fi
    log "停止旧进程 PID $old"
    kill "$old"
    for _ in $(seq 1 15); do
      kill -0 "$old" 2>/dev/null || break
      sleep 1
    done
    kill -0 "$old" 2>/dev/null && kill -9 "$old"
  fi
  rm -f "$PID_FILE"
}

# 检查本机端口是否已被监听
port_busy() {
  (exec 3<>"/dev/tcp/127.0.0.1/$PORT") 2>/dev/null
}

node_ok || { install_node; node_ok || die "Node.js 安装失败 需要 20.9 以上版本"; }
command -v npm >/dev/null 2>&1 || die "npm 不可用 请检查 Node.js 安装"
log "Node $(node -v) npm $(npm -v)"

mkdir -p "$PID_DIR" "$LOG_DIR" .data/posts .data/locks
[ -w .data ] || die ".data 目录不可写 请调整属主"
[ "$(id -u)" -eq 0 ] && log "提示 当前以 root 运行 .data 的属主将是 root"

# 首次运行生成会话密钥 缺失时登录会直接报错
if ! grep -qs '^AUTH_SECRET=..*' .env.local .env.production; then
  printf '\nAUTH_SECRET=%s\n' "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >>.env.production
  log "已生成 AUTH_SECRET 写入 .env.production"
fi

stop_old
port_busy && die "端口 $PORT 已被占用 用 ss -lntp | grep :$PORT 查看占用进程"

need_install=0
[ -x node_modules/.bin/next ] || need_install=1
if [ -f node_modules/.package-lock.json ] && [ package-lock.json -nt node_modules/.package-lock.json ]; then
  need_install=1
fi
if [ "$need_install" -eq 1 ]; then
  log "安装依赖"
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund 2>&1 | tee "$TASK_LOG"
  else
    npm install --no-audit --no-fund 2>&1 | tee "$TASK_LOG"
  fi
  [ "${PIPESTATUS[0]}" -eq 0 ] || die "依赖安装失败 详见 $TASK_LOG"
fi

need_build=0
[ -f .next/BUILD_ID ] || need_build=1
if [ "$need_build" -eq 0 ]; then
  changed=$(find src public package.json package-lock.json next.config.ts postcss.config.mjs tsconfig.json -newer .next/BUILD_ID -print -quit 2>/dev/null)
  [ -n "$changed" ] && need_build=1
fi
if [ "$need_build" -eq 1 ]; then
  log "构建项目"
  NEXT_TELEMETRY_DISABLED=1 npm run build 2>&1 | tee "$TASK_LOG"
  [ "${PIPESTATUS[0]}" -eq 0 ] || die "构建失败 详见 $TASK_LOG"
fi

log "启动服务 端口 $PORT"
NEXT_TELEMETRY_DISABLED=1 nohup ./node_modules/.bin/next start -H "$HOST" -p "$PORT" >>"$APP_LOG" 2>&1 &
app_pid=$!
echo "$app_pid" >"$PID_FILE"

ready=0
for _ in $(seq 1 30); do
  kill -0 "$app_pid" 2>/dev/null || { tail -n 20 "$APP_LOG"; die "进程已退出 详见 $APP_LOG"; }
  if command -v curl >/dev/null 2>&1; then
    curl -fsS -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && { ready=1; break; }
  elif command -v wget >/dev/null 2>&1; then
    wget -q -T 2 -O /dev/null "http://127.0.0.1:$PORT/" && { ready=1; break; }
  else
    sleep 3
    ready=1
    break
  fi
  sleep 1
done
[ "$ready" -eq 1 ] || { tail -n 20 "$APP_LOG"; die "健康检查超时 详见 $APP_LOG"; }

log "启动成功 PID $app_pid 应用日志 $APP_LOG"