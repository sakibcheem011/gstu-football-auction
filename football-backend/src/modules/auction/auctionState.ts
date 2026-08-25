export interface Bid {
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: Date;
}

export interface AuctionState {
  status: 'IDLE' | 'ACTIVE' | 'PAUSED';
  mode: 'NORMAL' | 'BLIND';
  activePlayer: any | null;
  currentBid: number;
  highestBidderTeamId: string | null;
  bidHistory: Bid[];
  timer: number;
  basePrice: number;
  totalBudget: number;
  raiseTiers: any[];
  nextValidBid: number;
  blindBids: Record<string, { teamName: string, amount: number, timestamp: Date }>;
  initialTimer: number;
}

class AuctionStateManager {
  private state: AuctionState = {
    status: 'IDLE',
    mode: 'NORMAL',
    activePlayer: null,
    currentBid: 0,
    highestBidderTeamId: null,
    bidHistory: [],
    timer: 30,
    basePrice: 0,
    totalBudget: 1500000,
    raiseTiers: [],
    nextValidBid: 0,
    blindBids: {},
    initialTimer: 30
  };

  private timerInterval: NodeJS.Timeout | null = null;
  private onTickCallback: ((state: AuctionState) => void) | null = null;
  private onAuctionEndCallback: ((state: AuctionState) => void) | null = null;

  setOnTick(callback: (state: AuctionState) => void) {
    this.onTickCallback = callback;
  }

  setOnAuctionEnd(callback: (state: AuctionState) => void) {
    this.onAuctionEndCallback = callback;
  }

  getState() {
    return this.state;
  }

  startAuction(player: any, basePrice: number, totalBudget: number, raiseTiers: any[], defaultTimer: number = 60) {
    this.state = {
      status: 'ACTIVE',
      mode: 'NORMAL',
      activePlayer: player,
      currentBid: basePrice, // Initial value
      highestBidderTeamId: null,
      bidHistory: [],
      timer: defaultTimer,
      initialTimer: defaultTimer,
      basePrice,
      totalBudget,
      raiseTiers,
      nextValidBid: basePrice,
      blindBids: {}
    };
    this.startTimer();
  }

  private updateNextValidBid() {
    if (!this.state.highestBidderTeamId) {
      this.state.nextValidBid = this.state.basePrice;
      return;
    }
    const currentBid = this.state.currentBid;
    const bidPct = (currentBid / this.state.totalBudget) * 100;
    
    let raisePct = 0.5; // default fallback
    if (this.state.raiseTiers && this.state.raiseTiers.length > 0) {
      for (const tier of this.state.raiseTiers) {
        if (bidPct >= tier.minPct - 0.0001 && bidPct <= tier.maxPct + 0.0001) {
          raisePct = tier.raisePct;
          break;
        }
      }
    }
    const raiseAmount = Math.round((this.state.totalBudget * raisePct) / 100);
    this.state.nextValidBid = currentBid + raiseAmount;
  }

  pauseAuction() {
    if (this.state.status === 'ACTIVE') {
      this.state.status = 'PAUSED';
      this.stopTimer();
      return true;
    }
    return false;
  }

  resumeAuction() {
    if (this.state.status === 'PAUSED') {
      this.state.status = 'ACTIVE';
      this.startTimer();
      return true;
    }
    return false;
  }

  setMode(mode: 'NORMAL' | 'BLIND') {
    this.state.mode = mode;
  }

  setTimer(seconds: number) {
    this.state.timer = seconds;
    this.state.initialTimer = seconds;
  }

  extendTimer(seconds: number) {
    this.state.timer += seconds;
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.state.timer > 0) {
        this.state.timer--;
        if (this.onTickCallback) this.onTickCallback(this.state);
      } else {
        this.stopTimer();
        if (this.state.mode === 'BLIND') {
          this.resolveBlindBids();
        }
        if (this.onAuctionEndCallback) this.onAuctionEndCallback(this.state);
      }
    }, 1000);
  }

  private resolveBlindBids() {
    let highestBid = 0;
    let highestTeamId: string | null = null;
    let earliestTime = new Date();

    for (const [teamId, bid] of Object.entries(this.state.blindBids)) {
      if (bid.amount > highestBid || (bid.amount === highestBid && bid.timestamp < earliestTime)) {
        highestBid = bid.amount;
        highestTeamId = teamId;
        earliestTime = bid.timestamp;
      }
    }

    if (highestTeamId) {
      this.state.currentBid = highestBid;
      this.state.highestBidderTeamId = highestTeamId;
      // also log it to history for podium
      this.state.bidHistory.unshift({
        teamId: highestTeamId,
        teamName: this.state.blindBids[highestTeamId].teamName,
        amount: highestBid,
        timestamp: this.state.blindBids[highestTeamId].timestamp
      });
    }
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  placeBid(teamId: string, teamName: string, amount: number): boolean {
    if (this.state.status !== 'ACTIVE') return false;
    
    if (this.state.mode === 'BLIND') {
      if (amount < this.state.basePrice) return false;
      this.state.blindBids[teamId] = { teamName, amount, timestamp: new Date() };
      return true;
    }
    
    // In normal mode, bid must be >= nextValidBid
    if (this.state.mode === 'NORMAL' && this.state.highestBidderTeamId !== null && amount < this.state.nextValidBid) {
      return false;
    }
    
    if (amount < this.state.basePrice) return false;

    this.state.currentBid = amount;
    this.state.highestBidderTeamId = teamId;
    this.state.bidHistory.unshift({
      teamId,
      teamName,
      amount,
      timestamp: new Date()
    });
    
    if (this.state.bidHistory.length > 50) {
      this.state.bidHistory.pop();
    }
    
    // Reset timer to the initially set timer for this player
    if (this.state.timer < this.state.initialTimer) {
      this.state.timer = this.state.initialTimer;
    }
    
    this.updateNextValidBid();
    
    return true;
  }

  rollbackLastBid(): boolean {
    if (this.state.bidHistory.length === 0) return false;
    
    this.state.bidHistory.shift(); // Remove last bid
    if (this.state.bidHistory.length > 0) {
      const prevBid = this.state.bidHistory[0];
      this.state.currentBid = prevBid.amount;
      this.state.highestBidderTeamId = prevBid.teamId;
    } else {
      this.state.currentBid = this.state.basePrice;
      this.state.highestBidderTeamId = null;
    }
    this.updateNextValidBid();
    return true;
  }

  clearAuction() {
    this.stopTimer();
    this.state = {
      status: 'IDLE',
      mode: 'NORMAL',
      activePlayer: null,
      currentBid: 0,
      highestBidderTeamId: null,
      bidHistory: [],
      timer: 30,
      initialTimer: 30,
      basePrice: 0,
      totalBudget: 1500000,
      raiseTiers: [],
      nextValidBid: 0,
      blindBids: {}
    };
  }
}

export const auctionState = new AuctionStateManager();
