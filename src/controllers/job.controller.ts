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
    if (req.method === 'POST') {
      job = await prisma.job.create({
        data: {
          ...inputData,
        },
      });
    } else if (req.method === 'PUT') {
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
    const { title, company, location } = req.query;
    const { page, limit, skip } = paginate(req);
    console.log(page, limit, skip);

    const where: any = {
      userId: req.user.id,
    };
    
    if (title) where.title = { contains: title, mode: 'insensitive' };
    if (company) where.company = { contains: company, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    const job = await prisma.job.findMany({
      take: limit,
      skip: skip,
      orderBy: { applyDate: 'desc' },
      where,
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
            addDate: true,
            createdAt: true,
          },
          orderBy: [{ addDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
    const total = await prisma.job.count({ where });
    
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
        totalPages: total > 0 ? Math.ceil(total / limit) : 1,
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
            addDate: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ addDate: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!job) return invalidResponse(res, 'Job not found');
    job.statuses =
      job.statuses.length === 0
        ? [
            {
              id: '',
              status: 'No Response',
              addDate: job.applyDate,
              createdAt: job.createdAt,
              updatedAt: job.createdAt,
            },
          ]
        : job.statuses;
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
