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
    const { widget, token } = await req.json();
    const user = await getUserByToken(token);
      const createdWidget = await prisma.widget.create({
      data: {
        name: widget.name,
        desc: widget.desc ?? "",
        apiUrl: widget.apiUrl,
        refreshSec: Number(widget.refreshSec),
        displayMode: widget.displayMode,
        parsedData: widget.parsedData,
        config: widget.config,   
        rawData: widget.rawData,
         userId:  user.id,
        createdAt: new Date(),
       },
    });

    return new Response(JSON.stringify(createdWidget), { status: 201 });
  } catch (err) {
    console.log(err.message) 
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
