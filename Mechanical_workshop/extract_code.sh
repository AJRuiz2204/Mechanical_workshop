#!/usr/bin/env bash

# Fichero de salida
output="all_code.txt"
: > "$output"

# Carpetas a procesar
dirs=("Controllers" "Data" "DTOs" "Models" "Profiles")

for dir in "${dirs[@]}"; do
  if [[ -d "$dir" ]]; then
    find "$dir" -type f -name "*.cs" | while read -r file; do
      echo "===== $file =====" >> "$output"
      cat "$file" >> "$output"
      echo -e "\n" >> "$output"
    done
  fi
done

echo "Extracción completada en $output"
chmod +x "$0"
