// functions/api/records.js

export async function onRequestGet(context) {
  // 讀取資料
  try {
    const { results } = await context.env.MY_DB.prepare(
      "SELECT * FROM sales_data ORDER BY year DESC, month DESC, id DESC"
    ).all();
    return Response.json(results);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  // 上傳資料
  try {
    const records = await context.request.json();
    
    if (!records || records.length === 0) {
        return new Response("No data provided", { status: 400 });
    }

    const stmt = context.env.MY_DB.prepare(
      "INSERT INTO sales_data (year, month, region, product, metric, value) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const batch = records.map(r => stmt.bind(r.year, r.month, r.region, r.product, r.metric, r.value));
    await context.env.MY_DB.batch(batch);

    return new Response("Upload Success", { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

// ⭐️ 新增：刪除功能的權限
export async function onRequestDelete(context) {
  try {
    // 取得網址上的參數 (例如 ?year=2025&month=08)
    const url = new URL(context.request.url);
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month");

    if (!year || !month) {
      return new Response("請提供年份與月份", { status: 400 });
    }

    // 執行刪除指令
    await context.env.MY_DB.prepare(
      "DELETE FROM sales_data WHERE year = ? AND month = ?"
    ).bind(year, month).run();

    return new Response("Deleted", { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
