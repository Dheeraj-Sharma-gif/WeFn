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
    const { token } = await req.json();
    const user = await getUserByToken(token);

    const widgets = await prisma.widget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return new Response(JSON.stringify(widgets), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}