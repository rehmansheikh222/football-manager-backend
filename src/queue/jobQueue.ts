import fs from 'fs';
import path from 'path';
import { Job } from '../types';

const QUEUE_DIR = path.join(process.cwd(), 'queue');
const JOBS_FILE = path.join(QUEUE_DIR, 'jobs.json');

export class JobQueue {
  constructor() {
    this.ensureQueueDirectory();
  }

  private ensureQueueDirectory() {
    if (!fs.existsSync(QUEUE_DIR)) {
      fs.mkdirSync(QUEUE_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(JOBS_FILE)) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
    }
  }

  async addJob(job: Job): Promise<void> {
    const jobs = this.getJobs();
    jobs.push(job);
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  }

  async getNextJob(): Promise<Job | null> {
    const jobs = this.getJobs();
    return jobs.length > 0 ? jobs[0] : null;
  }

  async removeJob(jobId: string): Promise<void> {
    const jobs = this.getJobs();
    const filteredJobs = jobs.filter(job => job.id !== jobId);
    fs.writeFileSync(JOBS_FILE, JSON.stringify(filteredJobs, null, 2));
  }

  private getJobs(): Job[] {
    try {
      const jobsData = fs.readFileSync(JOBS_FILE, 'utf-8');
      return JSON.parse(jobsData);
    } catch (error) {
      console.error('Error reading jobs file:', error);
      return [];
    }
  }

  async getJobCount(): Promise<number> {
    return this.getJobs().length;
  }
} 