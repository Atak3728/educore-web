import { Clerk } from '@clerk/clerk-sdk-node'
import prisma from '../lib/prisma.js'

export default async function handler(req, res) {
    const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })

    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No Authorization header' })
        }
        const token = authHeader.split(' ')[1]
        const { sub: userId } = await clerk.verifyToken(token)

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (req.method === 'GET') {
            const courses = await prisma.course.findMany({
                where: { userId },
                orderBy: { status: 'asc' } // Active first
            })
            return res.status(200).json(courses)
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
