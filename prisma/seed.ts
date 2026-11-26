import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { auth } from '../lib/auth';
import { ROWS, WISHLIST } from './seed-data';

const EMAIL = 'demo@phy10615.vn';
const PASSWORD = 'Demo@12345';

async function main() {
  // Xoá user demo cũ (Cascade sẽ xoá luôn giao dịch, wishlist, session, account)
  await prisma.user.deleteMany({ where: { email: EMAIL } });

  // Tạo user qua Better Auth để mật khẩu được băm (hash) đúng chuẩn
  const { user } = await auth.api.signUpEmail({
    body: { email: EMAIL, password: PASSWORD, name: 'Sinh viên demo' },
  });
  const userId = user.id;

  await prisma.transaction.createMany({
    data: ROWS.map((r) => ({ ...r, userId })),
  });
  await prisma.wishlistItem.createMany({
    data: WISHLIST.map((w) => ({ ...w, userId })),
  });
  console.log(`Đã tạo ${EMAIL} / ${PASSWORD}`);
}

main().finally(() => prisma.$disconnect());