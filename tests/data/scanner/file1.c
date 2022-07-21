typedef struct

  unsigned long used_memory;

  unsigned int uint_max;
  unsigned long ulong_max;

  json_settings settings;
  int first_pass;

  const json_char *ptr;
  unsigned int cur_line, cur_col;

} json_state;

static void *default_alloc(size_t size, int zero, void *user_data)
{
  return zero ? calloc(1, size) : malloc(size);
}

static void default_free(void *ptr, void *user_data)
{
  free(ptr);
}

static void *json_alloc(json_state *state, unsigned long size, int zero)
{
  if ((state->ulong_max - state->used_memory) < size)
    return 0;

  if (state->settings.max_memory && (state->used_memory += size) > state->settings.max_memory)
  {
    return 0;
  }

  return state->settings.mem_alloc(size, zero, state->settings.user_data);
}

static int new_value(json_state *state,
                     json_value **top, json_value **root, json_value **alloc,
                     json_type type) {}
