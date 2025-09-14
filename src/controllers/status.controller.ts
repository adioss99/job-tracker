import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { invalidResponse, valResponse } from '../helpers/errorResponse';
import { statusValSchema } from '../validations/status.validation';

const submitStatus = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    const { error, value } = statusValSchema({ ...req.body, jobId });
    if (error) return valResponse(res, error);

    const job = await prisma.job.findUnique({
      where: { id: jobId, userId: req.user.id },
      select: { id: true, title: true, company: true },
    });
    if (!job) return invalidResponse(res, 'Job not found');

    let status;
    if (req.method === 'POST') {
      status = await prisma.status.create({
        data: {
          ...value,
        },
      });
    } else if (req.method === 'PUT') {
      const statusId = req.query.statusId;
      console.log(statusId);
      if (!statusId || statusId.length !== 24) return invalidResponse(res, 'Status ID is required');

      status = await prisma.status.update({
        where: { id: String(statusId), jobId: jobId },
        data: value,
      });
      if (!status) return invalidResponse(res, 'Job not found');
    }

    res.status(201).json({
      success: true,
      data: status,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error submitting status',
      error: error.message,
    });
  }
};

const detailStatus = async (req: Request, res: Response) => {
  try {
    const statusId = req.params.statusId;
    if (!statusId || statusId.length !== 24) return invalidResponse(res, 'Status ID is required');
    const status = await prisma.status.findUnique({
      where: { id: statusId },
      include: { job: true },
    });
    if (!status) return invalidResponse(res, 'Status not found');
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error getting status',
      error: error.message,
    });
  }
};

const deleteStatus = async (req: Request, res: Response) => {
  try {
    const statusId = req.query.statusId;
    if (!statusId || statusId.length !== 24) return invalidResponse(res, 'Status ID is required');

    const status = await prisma.status.delete({
      where: { id: String(statusId) },
    });
    if (!status) return invalidResponse(res, 'Status not found');

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting status',
      error: error.message,
    });
  }
};

export default {
  submitStatus,
  deleteStatus,
  detailStatus,
};
