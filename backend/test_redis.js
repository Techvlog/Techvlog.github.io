const { client } = require("./service/redisclient");

async function test() {
  try {
    await client.set("test_key", "test_value");
    const val = await client.get("test_key");
    console.log("Redis Test Success:", val);
    process.exit(0);
  } catch (err) {
    console.error("Redis Test Failed:", err);
    process.exit(1);
  }
}

test();
