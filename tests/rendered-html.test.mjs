import assert from "node:assert/strict";
import test from "node:test";

test("renders the public live tracker shell", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>Beach Backyard Ultra — Live Team Singapore Coverage<\/title>/i);
  assert.match(html, /PACE-BASED/);
  assert.match(html, /WAO START \+ FINISH/);
  assert.match(html, /Wang Jian Jason/);
  assert.match(html, /Beach Backyard Ultra presented by Optimum Nutrition/);
  assert.doesNotMatch(html, /Moving gallery of the fifteen Team Singapore runners/);
  assert.doesNotMatch(html, /OPEN CATEGORY/);
});
