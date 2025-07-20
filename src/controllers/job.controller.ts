import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import { jobValSchema } from '../validations/job.validation';
import { invalidResponse, valResponse } from '../helpers/errorResponse';
import { paginate } from '../helpers/pagination';

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

const getJobs = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = paginate(req);

    const job = await prisma.job.findMany({
      take: limit,
      skip: skip,
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
    const jobs = job.map((j) => ({
      ...j,
      latestStatus: j.statuses[0]?.status || 'No Status',
    }));

    res.status(200).json({
      success: true,
      data: jobs.length === 0 ? null : jobs,
      pagination: {
        currentPage: page,
        totalItems: jobs.length,
        totalPages: Math.ceil(jobs.length / limit),
      },
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
    job.statuses = job.statuses.length === 0 ? [{ id: '', status: 'No Status' }] : job.statuses;
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
  getJobs,
  jobDetails,
  deleteJob,
};
