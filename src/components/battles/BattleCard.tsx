import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BattleCardProps {
  battle: {
    id: number;
    mc_a: string;
    mc_b: string;
    beat_url: string;
    ends_at: string;
    winner?: string;
    submission_a_votes: number;
    submission_b_votes: number;
    status: 'active' | 'finished';
    has_voted?: boolean;
  };
  onVote?: (battleId: number, submissionId: number) => void;
}

export const BattleCard = ({ battle, onVote }: BattleCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'a' | 'b' | null>(null);
  const { toast } = useToast();
  const { isGuest } = useAuth();

  const totalVotes = battle.submission_a_votes + battle.submission_b_votes;
  const mcAPercentage = totalVotes > 0 ? (battle.submission_a_votes / totalVotes) * 100 : 50;
  const mcBPercentage = totalVotes > 0 ? (battle.submission_b_votes / totalVotes) * 100 : 50;

  const timeRemaining = () => {
    const endTime = new Date(battle.ends_at);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const handlePlay = (track: 'a' | 'b') => {
    if (currentTrack === track && isPlaying) {
      setIsPlaying(false);
      setCurrentTrack(null);
    } else {
      setIsPlaying(true);
      setCurrentTrack(track);
      // Mock audio playback
      toast({
        title: `Playing ${track === 'a' ? battle.mc_a : battle.mc_b}'s track`,
        description: "Audio playback simulation",
      });
    }
  };

  const handleVote = (mcChoice: 'a' | 'b') => {
    if (isGuest) {
      toast({
        title: "Login required",
        description: "Please log in to vote in battles",
        variant: "destructive"
      });
      return;
    }

    if (battle.has_voted) {
      toast({
        title: "Already voted",
        description: "You can only vote once per battle!",
        variant: "destructive"
      });
      return;
    }

    const submissionId = mcChoice === 'a' ? 1 : 2;
    onVote?.(battle.id, submissionId);
  };

  return (
    <Card className="battle-glow hover:scale-[1.02] transition-all duration-300 animate-slide-up">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold neon-text">
            Battle #{battle.id}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={battle.status === 'active' ? 'default' : 'secondary'}>
              {battle.status === 'active' ? 'Live' : 'Finished'}
            </Badge>
            {battle.status === 'active' && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {timeRemaining()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contestants */}
        <div className="space-y-4">
          {/* MC A */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 electric-border">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePlay('a')}
                className="text-primary hover:text-primary-glow"
              >
                {currentTrack === 'a' && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div>
                <h4 className="font-semibold text-primary">{battle.mc_a}</h4>
                <p className="text-sm text-muted-foreground">
                  {battle.submission_a_votes} votes ({mcAPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
            {battle.status === 'active' && !battle.has_voted && (
              <Button
                variant="win"
                size="sm"
                onClick={() => handleVote('a')}
                disabled={isGuest}
              >
                {isGuest ? 'Login to Vote' : 'Vote'}
              </Button>
            )}
            {battle.winner === battle.mc_a && (
              <Badge variant="default" className="bg-battle-win">
                Winner
              </Badge>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <span className="text-lg font-bold text-accent neon-text">VS</span>
          </div>

          {/* MC B */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 electric-border">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePlay('b')}
                className="text-secondary hover:text-secondary/80"
              >
                {currentTrack === 'b' && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div>
                <h4 className="font-semibold text-secondary">{battle.mc_b}</h4>
                <p className="text-sm text-muted-foreground">
                  {battle.submission_b_votes} votes ({mcBPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
            {battle.status === 'active' && !battle.has_voted && (
              <Button
                variant="win"
                size="sm"
                onClick={() => handleVote('b')}
                disabled={isGuest}
              >
                {isGuest ? 'Login to Vote' : 'Vote'}
              </Button>
            )}
            {battle.winner === battle.mc_b && (
              <Badge variant="default" className="bg-battle-win">
                Winner
              </Badge>
            )}
          </div>
        </div>

        {/* Vote Progress */}
        {totalVotes > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary">{battle.mc_a}</span>
              <span className="text-secondary">{battle.mc_b}</span>
            </div>
            <div className="relative">
              <Progress value={mcAPercentage} className="h-2" />
            </div>
            <div className="flex justify-center items-center text-xs text-muted-foreground">
              <Users className="w-3 h-3 mr-1" />
              {totalVotes} total votes
            </div>
          </div>
        )}

        {/* Beat Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-cyber/10 border border-secondary/20">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">Battle Beat</span>
          </div>
          <Button variant="cyber" size="sm">
            Play Beat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};