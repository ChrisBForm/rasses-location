import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public/marguerite");
  const files = fs.readdirSync(dir).filter(f =>
    /\.(jpe?g|png|webp|avif|svg)$/i.test(f)
  );
  return Response.json(files.map(f => `/marguerite/${f}`));
}