import { mongodb } from '../utils/mongodb';
import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
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

    res.status(200).json({
      success: true,
      data: {
        totalJobApplied,
        totalJobLast30Days,
        applicationsResponded,
        applicationsRejected,
      },
    });
  } catch (error: string | any) {
    res.status(500).json({ success: false, message: 'Error getting dashboard', error: error.message });
  }
};

const chartData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const jobs = await mongodb('Job');

    const tweleveMonthsAgo = new Date();
    tweleveMonthsAgo.setMonth(tweleveMonthsAgo.getMonth() - 12);
    
    const last12Months = await jobs
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            applyDate: { $gte: tweleveMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateTrunc: { date: '$applyDate', unit: 'month' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ])
      .toArray();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30Days = await jobs
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            applyDate: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateTrunc: { date: '$applyDate', unit: 'day' } }, // truncate to day
            count: { $count: {} },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    res.status(200).json({ success: true, data: { last12Months, last30Days } });
  } catch (error: string | any) {
    res.status(500).json({ success: false, message: 'Error getting chart data', error: error.message });
  }
};

export default { index, chartData };
