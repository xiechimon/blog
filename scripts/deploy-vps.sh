#!/usr/bin/env bash
set -euo pipefail

# 同步构建产物到 VPS(SSH 别名 pqy,由 ~/.ssh/config 里的 Host pqy 解析),
# 由 nginx 在那边直接作为静态文件目录托管，对外通过 Cloudflare Tunnel 暴露成 https://blog.xmon.me
rsync -avz --delete dist/ pqy:/var/www/blog/
