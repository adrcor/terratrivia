variable "dev_url" {
  type    = string
  default = "postgres://atlas:atlas@localhost:5678/atlas?sslmode=disable&search_path=public"
}

env "local" {
  src = "file://db/schema.sql"
  dev = var.dev_url
  migration {
    dir = "file://db/migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
