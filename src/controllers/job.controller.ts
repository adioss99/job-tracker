import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import { jobValSchema } from '../validations/job.validation';
import { invalidResponse, valResponse } from '../helper/errorResponse';

const submitJob = async (req: Request, res: Response) => {
  try {
    const { error, value } = jobValSchema(req.body);
    if (error) return valResponse(res, error);

    const inputData = {
      ...value,
      userId: req.user.id,
    };

    let job;
    if (req.params.method === 'create') {
      job = await prisma.job.create({
        data: {
          ...inputData,
          statuses: {
            create: {
              status: 'Just Applied',
            },
          },
        },
      });
    } else {
      const jobId = req.params.jobId;
      if (!jobId || jobId.length !== 24) return invalidResponse(res, 'Invalid id');

      const find = await prisma.job.findUnique({
        where: { id: jobId },
      });
      if (!find) return invalidResponse(res, 'Job not found');

      job = await prisma.job.update({
        where: { id: jobId },
        data: inputData,
      });
    }

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message,
    });
  }
};

const getJob = async (req: Request, res: Response) => {
  try {
    let jobs: any[] = [];
    const job = await prisma.job.findMany({
      orderBy: { applyDate: 'desc' },
      where: { userId: req.user.id },
      select: {
        id: true,
        title: true,
        company: true,
        role: true,
        type: true,
        location: true,
        applyDate: true,
        statuses: {
          select: {
            id: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    jobs = job.map((j) => ({
      ...j,
      latestStatus: j.statuses[0]?.status || 'No Status',
    }));

    res.status(200).json({
      success: true,
      data: jobs.length === 0 ? null : jobs,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving job',
      error: error.message,
    });
  }
};

const jobDetails = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    if (!jobId || jobId.length !== 24) return invalidResponse(res, 'Job ID is required');

    const job = await prisma.job.findUnique({
      where: { id: jobId, userId: req.user.id },
      include: {
        statuses: {
          select: {
            id: true,
            status: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!job) return invalidResponse(res, 'Job not found');

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving job details',
      error: error.message,
    });
  }
};
const deleteJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    if (!jobId || jobId.length !== 24) return invalidResponse(res, 'Job ID is required');

    const find = await prisma.job.findUnique({
      where: { id: jobId, userId: req.user.id },
    });
    if (!find) return invalidResponse(res, 'Job not found');

    const job = await prisma.job.delete({
      where: { id: jobId },
      include: {
        statuses: true,
      },
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message,
    });
  }
};

export default {
  submitJob,
  getJob,
  jobDetails,
  deleteJob,
};
