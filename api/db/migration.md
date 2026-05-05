# db migrations

`db/schema.sql` is the source of truth for the database schema. Edit it, then
Atlas generates a SQL migration from the diff. Kysely's migrator applies those
`.sql` files at app boot.

## Commands

| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `bun db:migrate`         | Apply pending migrations (runs in production at boot)  |
| `bun db:down`            | Revert the latest migration (dev only)                 |
| `bun db:generate <name>` | Generate a new migration from `schema.sql` deltas      |
| `bun db:diff`            | Show drift between `schema.sql` and migrations         |
| `bun db:hash`            | Recompute `atlas.sum` (after hand-editing a migration) |
| `bun db:validate`        | Check `atlas.sum` integrity                            |

The `db:generate` and `db:diff` commands both need the dev DB instance to be up:

```bash
docker compose -f db/docker-compose.atlas.yml up -d
```

## New migration

Then:

```bash
$EDITOR db/schema.sql                  # 1. edit db source of truth
bun db:generate add_foo                # 2. generate migration
cat db/migrations/<latest>.sql         # 3. review migration
bun db:diff                            # 4. confirm in sync
bun db:migrate                         # 5. apply locally
```

## Other

### Renames

Atlas can't tell a rename from a drop+create. If you rename a column in
`schema.sql`, the generated migration will be `DROP COLUMN old; ADD COLUMN
new;` — which loses data.

To rename safely:

1. `bun db:generate rename_foo`
2. Open the generated `.sql` and replace the drop+add with
   `ALTER TABLE ... RENAME COLUMN old TO new;`
3. `bun db:hash` to refresh `atlas.sum`
4. `bun db:migrate` locally to confirm

### Rollbacks

Atlas doesn't generate down migrations, so rollback must be handled manually.
Forward migration rollbacks are recommended over deleting the migration file
& patching the kysely migration table.

The rollback SQL can be generated with:

```bash
atlas schema diff --from "file://db/migrations?format=atlas" --to "file://db/migrations?format=atlas&version=<version>" --env local -c file://db/atlas.hcl
```

**For devevlopment**, `bun db:down` reverts the latest migration: it computes the diff
to the previous migration via Atlas, applies it, and removes the row from
`kysely_migration`. Not recommended for production as it uses the Atlas's CLI.

### Better-Auth schema generation

Add the following option to the database pool to force the whole schema to be generated and not just the diff:

```ts
{
  // ...
  options: "-c search_path=missing_schema";
}
```

Generate the schema:

```bash
bunx auth@latest generate --output db/better-auth.sql

```

Copy-paste into `schema.sql`.
