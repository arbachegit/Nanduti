#!/usr/bin/env bash
# Barreira do dono (CLAUDE.md §-1, 18/08/2026).
#
# Recusa, no nivel do harness, os comandos que causaram dano real neste projeto:
# publicar em producao e apagar/desfazer trabalho. Nao pergunta — recusa. Quem
# executa qualquer um destes e o DONO, no proprio terminal.
#
# Entrada: JSON do PreToolUse em stdin. Saida: JSON de decisao.
set -uo pipefail

cmd="$(jq -r '.tool_input.command // ""' 2>/dev/null)"
[ -z "$cmd" ] && { echo '{}'; exit 0; }

deny() {
  jq -n --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

# Publicacao em producao (push em main dispara o deploy).
case "$cmd" in
  *"git push"*) deny "BLOQUEADO por .claude/hooks/guard-destructive.sh: 'git push' publica em producao. Peca ao dono que execute, ou use '! git push origin main' no proprio terminal dele." ;;
esac

# Desfazer/apagar trabalho versionado.
case "$cmd" in
  *"git revert"*)        deny "BLOQUEADO: 'git revert' desfaz trabalho. So o dono executa." ;;
  *"git reset"*)         deny "BLOQUEADO: 'git reset' descarta estado. So o dono executa." ;;
  *"git checkout "*--*)  deny "BLOQUEADO: 'git checkout -- <arquivo>' descarta alteracoes nao commitadas. So o dono executa." ;;
  *"git restore"*)       deny "BLOQUEADO: 'git restore' descarta alteracoes. So o dono executa." ;;
  *"git clean"*)         deny "BLOQUEADO: 'git clean' apaga arquivos nao rastreados. So o dono executa." ;;
  *"git rm"*)            deny "BLOQUEADO: 'git rm' apaga arquivo do repositorio. So o dono executa." ;;
esac

# Apagar arquivo no disco. Cobre 'rm' como comando, nao a palavra dentro de outra.
if printf '%s' "$cmd" | grep -Eq '(^|[[:space:];&|(])rm([[:space:]]|$)'; then
  deny "BLOQUEADO: 'rm' apaga arquivo. Se algo parece descartavel, REPORTE e pare (CLAUDE.md §-1). So o dono apaga."
fi

echo '{}'
