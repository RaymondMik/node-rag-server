create table data (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding vector(1536) -- 1536 works for OpenAI embeddings
);