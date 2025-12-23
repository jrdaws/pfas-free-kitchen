#!/bin/bash
#===============================================================================
# AGENT RUNNER - Semi-Automated Agent Execution
#===============================================================================
# Usage: ./scripts/run-agent.sh [agent-name]
# Example: ./scripts/run-agent.sh testing
#          ./scripts/run-agent.sh platform
#          ./scripts/run-agent.sh all
#
# This script displays the task for an agent. You copy the output and paste
# it into a new Cursor chat. The agent will execute and write results to outbox.
#===============================================================================

set -e

AGENT=$1
OUTPUT_DIR="output"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo ""
    echo "Usage: ./scripts/run-agent.sh [agent-name]"
    echo ""
    echo "Available agents:"
    echo "  testing        - Testing Agent (P1 - validate API)"
    echo "  platform       - Platform Agent (P2 - parallel execution)"
    echo "  cli            - CLI Agent (P2 - deploy command)"
    echo "  website        - Website Agent (P2 - streaming UI)"
    echo "  template       - Template Agent (P2 - health check)"
    echo "  documentation  - Documentation Agent (P2 - user guide)"
    echo "  all            - Show all pending tasks"
    echo ""
    echo "Example:"
    echo "  ./scripts/run-agent.sh testing"
    echo ""
}

show_task() {
    local agent=$1
    local inbox_dir="$OUTPUT_DIR/${agent}-agent/inbox"
    
    if [ ! -d "$inbox_dir" ]; then
        echo -e "${RED}Error: Agent inbox not found: $inbox_dir${NC}"
        return 1
    fi
    
    local task_file=$(ls -1 "$inbox_dir"/*.txt 2>/dev/null | head -1)
    
    if [ -z "$task_file" ]; then
        echo -e "${YELLOW}No pending tasks for ${agent} agent${NC}"
        return 0
    fi
    
    local agent_upper=$(echo "$agent" | tr '[:lower:]' '[:upper:]')
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  TASK FOR: ${agent_upper} AGENT${NC}"
    echo -e "${GREEN}  FILE: $task_file${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Copy this one-liner into a new Cursor chat:${NC}"
    echo ""
    echo -e "${YELLOW}Read and execute the task in $task_file${NC}"
    echo ""
    echo -e "${GREEN}───────────────────────────────────────────────────────────────${NC}"
    echo ""
}

show_all_tasks() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ALL PENDING AGENT TASKS${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    for agent_dir in $OUTPUT_DIR/*-agent; do
        if [ -d "$agent_dir/inbox" ]; then
            agent_name=$(basename "$agent_dir" | sed 's/-agent//')
            task_count=$(ls -1 "$agent_dir/inbox"/*.txt 2>/dev/null | wc -l | tr -d ' ')
            
            if [ "$task_count" -gt 0 ]; then
                task_file=$(ls -1 "$agent_dir/inbox"/*.txt 2>/dev/null | head -1)
                agent_upper=$(echo "$agent_name" | tr '[:lower:]' '[:upper:]')
                echo -e "${YELLOW}${agent_upper}${NC} ($task_count task(s))"
                echo "  Read and execute the task in $task_file"
                echo ""
            fi
        fi
    done
}

# Main
if [ -z "$AGENT" ]; then
    show_help
    exit 0
fi

case $AGENT in
    testing|platform|cli|website|template|documentation|integration)
        show_task "$AGENT"
        ;;
    all)
        show_all_tasks
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown agent: $AGENT${NC}"
        show_help
        exit 1
        ;;
esac

