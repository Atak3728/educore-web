import { Clerk } from '@clerk/clerk-sdk-node'
import prisma from '../lib/prisma.js'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No Authorization header' })
        }
        const token = authHeader.split(' ')[1]
        const { sub: userId } = await clerk.verifyToken(token)

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Parallel fetch for dashboard stats
        const [
            studentsCount,
            activeCourses,
            recentPayments,
            monthlyTarget
        ] = await Promise.all([
            prisma.student.count({ where: { userId, status: 'Active' } }),
            prisma.course.count({ where: { userId, status: 'Active' } }),
            prisma.payment.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 5
            }),
            prisma.settings.findUnique({
                where: { userId },
                select: { currency: true } // Example settings fetch
            })
        ])

        return res.status(200).json({
            stats: {
                totalStudents: studentsCount,
                activeCourses: activeCourses,
            },
            recentPayments,
            currency: monthlyTarget?.currency || 'USD'
        })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
