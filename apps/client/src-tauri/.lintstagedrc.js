export default {
  '**/*.rs': [
    'cargo clippy --fix -- -A clippy::missing_errors_doc',
    'cargo fmt'
  ]
} 