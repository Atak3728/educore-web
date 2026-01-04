import { Clerk } from '@clerk/clerk-sdk-node'
import prisma from './_db.js'

export default async function handler(req, res) {
    const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })

    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No Authorization header' })
        }
        const token = authHeader.split(' ')[1]
        await clerk.verifyToken(token)
        // Note: userId is no longer used in the schema, but we verify the token for security.
    } catch (error) {
        console.error('Authentication Error:', error)
        return res.status(401).json({ error: 'Authentication failed' })
    }

    try {
        const prisma = (await import('./_db.js')).default;

        if (req.method === 'GET') {
            const start = Date.now();
            const students = await prisma.student.findMany({
                orderBy: { createdAt: 'desc' },
                include: { enrollments: true, payments: true }
            });
            const duration = Date.now() - start;
            res.setHeader('X-Db-Duration', duration);
            console.log(`[API] GET /students DB_QUERY: ${duration}ms`);

            return res.status(200).json(students);
        } else if (req.method === 'POST') {
            const { name, studentPhone, fatherName, fatherPhone, motherName, motherPhone, notes, photo } = req.body;

            // Map legacy phone to studentPhone if needed, though we updated frontend.
            // Just ensuring we don't save 'email'.

            const start = Date.now();
            const result = await prisma.student.create({
                data: {
                    name,
                    studentPhone: studentPhone || req.body.phone, // fallback
                    fatherName,
                    fatherPhone,
                    motherName,
                    motherPhone,
                    notes,
                    // photo field is not in schema? Check schema.
                    // Schema: name, studentPhone, fatherName... no photo.
                    // Ignoring photo for now as per schema.
                }
            });
            const duration = Date.now() - start;
            res.setHeader('X-Db-Duration', duration);
            console.log(`[API] POST /students DB_QUERY: ${duration}ms`);

            return res.status(201).json(result);
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
