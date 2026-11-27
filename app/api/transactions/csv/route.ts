import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { toDateInput } from "@/lib/finance";
import { parseTransactionsCsv } from "@/lib/validation";

// GET /api/transactions/csv -> Xuất toàn bộ giao dịch của user ra file CSV
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const rows = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const header = "date,type,category,amount,description";
  const body = rows.map((r) => {
    const cleanDesc = r.description.replace(/"/g, '""');
    return `${toDateInput(r.date)},${r.type},${r.category},${r.amount},"${cleanDesc}"`;
  });

  // Thêm BOM \uFEFF để Excel hiển thị đúng tiếng Việt UTF-8
  const csv = "\uFEFF" + [header, ...body].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="transactions.csv"',
    },
  });
}

// POST /api/transactions/csv -> Nhập giao dịch từ file CSV (có kiểm tra định dạng)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const text = await request.text();
  const parsed = parseTransactionsCsv(text);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  await prisma.transaction.createMany({
    data: parsed.rows.map((r) => ({
      ...r,
      date: new Date(r.date),
      userId: user.id,
    })),
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return Response.json({
    ok: true,
    imported: parsed.rows.length,
    message: `Đã nhập thành công ${parsed.rows.length} giao dịch từ CSV`,
  });
}