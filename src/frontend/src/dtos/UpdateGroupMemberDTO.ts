import type { GroupMemberInterface } from '@/interfaces/GroupMemberInterface';

export type UpdateGroupMemberDTO = Partial<Pick<GroupMemberInterface, 'memberStatusId'>>;
