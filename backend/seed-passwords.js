const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const h1 = await bcrypt.hash('Admin123!', 10);
  const h2 = await bcrypt.hash('Empleado123!', 10);
  await prisma.usuario.updateMany({ where: { rol: { in: ['ADMINISTRADOR', 'GESTOR_RRHH'] } }, data: { contrasena: h1 } });
  await prisma.usuario.updateMany({ where: { rol: 'EMPLEADO' }, data: { contrasena: h2 } });
  console.log('Listo! Admin: Admin123! / Empleados: Empleado123!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
