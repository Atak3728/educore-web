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
    } catch (error) {
        console.error('Authentication Error:', error)
        return res.status(401).json({ error: 'Authentication failed' })
    }

    try {
        if (req.method === 'GET') {
            const courses = await prisma.course.findMany({
                orderBy: { status: 'asc' } // Active first
            })
            return res.status(200).json(courses)
        }

        if (req.method === 'POST') {
            const {
                name,
                description,
                status,
                startDate,
                endDate,
                fee,
                maxPoints,
                requiredTasks
            } = req.body

            if (!name) return res.status(400).json({ error: 'Name is required' })
            if (!startDate) return res.status(400).json({ error: 'Start Date is required' })
            if (fee === undefined || fee === null) return res.status(400).json({ error: 'Fee is required' })

            const newCourse = await prisma.course.create({
                data: {
                    name,
                    description: description || null,
                    status: status || 'Active',
                    startDate: new Date(startDate), // Ensure Date object
                    endDate: endDate ? new Date(endDate) : null,
                    fee: parseFloat(fee),
                    maxPoints: maxPoints ? parseInt(maxPoints) : 100,
                    requiredTasks: requiredTasks || [] // Critical: Default to empty array
                }
            })
            return res.status(201).json(newCourse)
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
