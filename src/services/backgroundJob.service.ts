import { JobQueue } from '../queue/jobQueue';
import { TeamService } from './team.service';
import { Job } from '../types';

export class BackgroundJobService {
  private jobQueue: JobQueue;
  private teamService: TeamService;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.jobQueue = new JobQueue();
    this.teamService = new TeamService();
  }

  start() {
    console.log('Starting background job service...');
    this.intervalId = setInterval(() => {
      this.processJobs();
    }, 2000); // Run every 2 seconds
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Background job service stopped');
    }
  }

  private async processJobs() {
    if (this.isProcessing) {
      return; // Skip if already processing
    }

    this.isProcessing = true;

    try {
      const job = await this.jobQueue.getNextJob();
      
      if (!job) {
        this.isProcessing = false;
        return;
      }

      console.log(`Processing job: ${job.id} of type: ${job.type}`);

      await this.processJob(job);
      
      // Remove job from queue after successful processing
      await this.jobQueue.removeJob(job.id);
      
      console.log(`Job ${job.id} completed successfully`);
    } catch (error) {
      console.error('Error processing job:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: Job) {
    switch (job.type) {
      case 'CREATE_TEAM':
        await this.teamService.createTeam(
          job.payload.userId,
          job.payload.teamName
        );
        break;
      default:
        console.warn(`Unknown job type: ${job.type}`);
    }
  }

  async addTeamCreationJob(userId: number, teamName: string) {
    const job: Job = {
      id: `team-creation-${userId}-${Date.now()}`,
      type: 'CREATE_TEAM',
      payload: {
        userId,
        teamName,
      },
      createdAt: new Date(),
    };

    await this.jobQueue.addJob(job);
    console.log(`Added team creation job for user ${userId}`);
  }
} 