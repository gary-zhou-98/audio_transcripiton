export interface Prompt {
  title: string;
  text: string;
}

const promptStore: Prompt[] = [
  {
    title: "Job Interview: The Dream Opportunity",
    text: `[Interviewer]: "Good morning, and thank you for joining us today."

          [Candidate]: "Good morning! I'm really excited to be here. I've been following your company's work for a while now, and the prospect of contributing to your innovative projects truly inspires me."

          [Interviewer]: "That’s wonderful to hear. Can you share what drives you to excel in your work?"

          [Candidate]: "Absolutely. I thrive on challenges and love finding creative solutions to complex problems. In my previous role, I led a team that improved our project turnaround time by 30%, and I’m eager to bring that same energy and insight here."

          [Interviewer]: "Impressive! What do you think sets you apart from other candidates?"

          [Candidate]: "I believe it's my blend of technical expertise and a strong passion for collaboration. I not only focus on delivering results but also on fostering an environment where ideas can flourish. I see every challenge as an opportunity to learn and grow."

          [Interviewer]: "That’s exactly what we’re looking for. Thank you for sharing your story."

          [Candidate]: "Thank you for this opportunity. I'm really looking forward to the possibility of contributing to your team."`,
  },
  {
    title: "Mystery at the Manor",
    text: `[Detective]: "It’s a dark, stormy night at the manor, and something about this case just doesn’t add up."

          [Partner]: "I couldn’t agree more. The disappearance of that priceless heirloom and the eerie sounds echoing through the halls — it’s all very unsettling. What’s your gut telling you?"

          [Detective]: "I suspect there's a hidden motive behind these events. Perhaps someone within the manor is trying to cover their tracks, using the chaos of the storm as a distraction."

          [Partner]: "Do you think one of the staff members might be involved, or could it be the recent guest who acted so strangely?"

          [Detective]: "Both are possibilities. The staff knows every secret of this place, and that guest’s behavior was undeniably odd. We need to question everyone and piece together these clues carefully."

          [Partner]: "I’m ready when you are. Let’s start re-interviewing the staff and reviewing the guest logs. Every detail could be crucial."

          [Detective]: "Exactly. We must leave no stone unturned. Let’s get to work."`,
  },
  {
    title: "Counselor Chat: Embracing Change",
    text: `[Counselor]: "I know change can feel daunting, and sometimes it's hard to see the light at the end of the tunnel. How have you been coping with these recent shifts in your life?"

          [Client]: "Honestly, I’ve been feeling pretty overwhelmed and unsure of myself. It’s like everything is moving so fast, and I’m struggling to keep up."

          [Counselor]: "It sounds incredibly challenging. Sometimes, when everything feels uncertain, it helps to focus on what we can control. Have you thought about what small steps might help you feel more grounded?"

          [Client]: "I have, actually. I’m trying to focus on the positive possibilities that change might bring, even though it's hard to see them right now."

          [Counselor]: "That’s a very thoughtful approach. Embracing change often means taking a leap of faith and trusting that each step will lead to growth. What’s one change, however small, that you’re willing to try right now?"

          [Client]: "Maybe starting with a daily routine or setting aside time for self-reflection. It might sound simple, but I think it could really help me gain some clarity."

          [Counselor]: "Absolutely. Sometimes the smallest changes can make the biggest difference. I believe in your ability to navigate these challenges, and together, we can explore new opportunities for growth."`,
  },
];

export default promptStore;
