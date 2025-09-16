import prisma from '../utils/prisma';
import { Request, Response } from 'express';

const index = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const [totalJobApplied, totalJobLast30Days, applicationsResponded, applicationsRejected] = await prisma.$transaction([
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, applyDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.job.count({
        where: {
          userId,
          statuses: {
            some: {
              NOT: {
                status: 'Rejected',
              },
            },
          },
        },
      }),
      prisma.job.count({ where: { userId, statuses: { some: { status: 'Rejected' } } } }),
    ]);
    res.status(200).json({ success: true, data: { totalJobApplied, totalJobLast30Days, applicationsResponded, applicationsRejected } });
  } catch (error: string | any) {
    res.status(500).json({ success: false, message: 'Error getting dashboard', error: error.message });
  }
};

export default { index };
