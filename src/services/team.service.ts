import prisma from '../config/database';
import { Position } from '../types';
import { Prisma } from '@prisma/client';

export class TeamService {
  async createTeam(userId: number, teamName: string) {
    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create team
        const team = await tx.team.create({
          data: {
            ownerId: userId,
            teamName,
            budget: 5000000,
            playersCount: 20,
          },
        });

        // Generate player names
        const playerNames = this.generatePlayerNames();

        // Create players
        const players = await Promise.all([
          // 3 Goalkeepers
          ...Array.from({ length: 3 }, (_, i) => 
            tx.player.create({
              data: {
                teamId: team.id,
                name: playerNames.goalkeepers[i],
                position: Position.GOALKEEPER,
              },
            })
          ),
          // 6 Defenders
          ...Array.from({ length: 6 }, (_, i) => 
            tx.player.create({
              data: {
                teamId: team.id,
                name: playerNames.defenders[i],
                position: Position.DEFENDER,
              },
            })
          ),
          // 6 Midfielders
          ...Array.from({ length: 6 }, (_, i) => 
            tx.player.create({
              data: {
                teamId: team.id,
                name: playerNames.midfielders[i],
                position: Position.MIDFIELDER,
              },
            })
          ),
          // 5 Attackers
          ...Array.from({ length: 5 }, (_, i) => 
            tx.player.create({
              data: {
                teamId: team.id,
                name: playerNames.attackers[i],
                position: Position.ATTACKER,
              },
            })
          ),
        ]);

        return { team, players };
      });
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  async getTeamByUserId(userId: number) {
    return await prisma.team.findUnique({
      where: { ownerId: userId },
      include: {
        players: true,
      },
    });
  }

  async getTeamById(teamId: number) {
    return await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: true,
      },
    });
  }

  private generatePlayerNames() {
    const firstNames = [
      'John', 'Mike', 'David', 'James', 'Robert', 'William', 'Richard', 'Joseph',
      'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald',
      'Steven', 'Paul', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George',
      'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
    ];

    const generateNames = (count: number) => {
      const names = [];
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        names.push(`${firstName} ${lastName}`);
      }
      return names;
    };

    return {
      goalkeepers: generateNames(3),
      defenders: generateNames(6),
      midfielders: generateNames(6),
      attackers: generateNames(5),
    };
  }
} 