#!/usr/bin/env bash

#
# Print help info
#
help() {
  echo "Usage: $0 [-h] -w winnowing.wfp -r result.json
               [-r file to result.json]
               [-w file to winnowing]"
  exit 2
}

cmd_compare_wfp_result() {
  result_json_path=$1
  winnowing_path=$2
  if [ ! -e "$result_json_path" ] || [ ! -e "$winnowing_path" ]; then
    echo "Error: Please, specify a valid path"
    exit 1
  fi

  diff <(sed -n -E 's/file=\w+,[[:digit:]]+,//p' "$winnowing_path" | sort) <(jq -r '.scanner | keys | .[]' "$result_json_path" | sort)

  exit 1
}


#
# Parse command options and take action
#
force=false
while getopts ":r:w:,h" o; do
  case "${o}" in
  r)
    r=${OPTARG}
    ;;
  w)
    w=${OPTARG}
    ;;
  h)
    help
    ;;
  *)
    echo "Unknown option: $o"
    help
    ;;
  esac
done
shift $((OPTIND - 1))

if [ -z "${r}" ] || [ -z "${w}" ]; then
  echo "Please specify a result json and a winnowing file"
  help
fi


cmd_compare_wfp_result "$r" "$w"
