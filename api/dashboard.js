import { Clerk } from '@clerk/clerk-sdk-node'
import prisma from './_db.js'

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
        // Note: Removing userId filters as new schema is currently single-tenant or shared
        const [
            studentsCount,
            activeCourses,
            recentPayments,
            appSettings
        ] = await Promise.all([
            prisma.student.count(), // Count all students
            prisma.course.count({ where: { status: 'Active' } }),
            prisma.payment.findMany({
                orderBy: { date: 'desc' },
                take: 5,
                include: { student: true, course: true } // Include details for display
            }),
            prisma.appSetting.findFirst()
        ])

        return res.status(200).json({
            stats: {
                totalStudents: studentsCount,
                activeCourses: activeCourses,
            },
            recentPayments,
            currency: 'USD' // appSettings?.currency // Schema doesn't have currency yet, defaulting
        })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
