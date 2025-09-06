import { prisma } from "@/app/actions/utils/prismaCl";

async function getUserByToken(token) {
  const userToken = await prisma.userToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!userToken) throw new Error("Invalid or expired token");
  return userToken.user;
}

export async function POST(req) {
  try {
    const { newLayout, token } = await req.json();
    const user = await getUserByToken(token);

    await prisma.widgetLayout.upsert({
      where: { userId: user.id },
      update: { layout: newLayout },
      create: { userId: user.id, layout: newLayout },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}