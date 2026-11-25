#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="1.7.4"
JAR="$ROOT/formal/tla/.cache/tla2tools.jar"
if [[ ! -f "$JAR" ]]; then
  mkdir -p "$(dirname "$JAR")"
  curl -fsSL -o "$JAR" "https://github.com/tlaplus/tlaplus/releases/download/v${VERSION}/tla2tools.jar"
fi
JAVA="java"
if ! java -version >/dev/null 2>&1; then
  if [[ -n "${JAVA_HOME:-}" && -x "$JAVA_HOME/bin/java" ]]; then
    JAVA="$JAVA_HOME/bin/java"
  elif [[ -x /opt/homebrew/opt/openjdk/bin/java ]]; then
    JAVA="/opt/homebrew/opt/openjdk/bin/java"
  else
    echo "Java is required to run TLC" >&2
    exit 1
  fi
fi
"$JAVA" -XX:+UseParallelGC -cp "$JAR" tlc2.TLC \
  -workers 1 \
  -config "$ROOT/formal/tla/StoryCreate.cfg" \
  "$ROOT/formal/tla/StoryCreate.tla"
