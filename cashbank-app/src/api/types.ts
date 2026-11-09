export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type OrganizationRole = 'OWNER' | 'EDITOR' | 'ANALYST';
export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
export type TransactionType = 'CREDIT_PURCHASE' | 'DEBIT_POST' | 'DEBIT_VERIFICATION' | 'REFUND_POST' | 'TIP_SENT' | 'TIP_RECEIVED' | 'REVIEW_REWARD' | 'WITHDRAWAL_HOLD' | 'WITHDRAWAL_REFUND' | 'BONUS';
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
export type PostStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAKE_REJECTED' | 'NEEDS_CLARIFICATION';
export type SortOrder = 'ASC' | 'DESC';

export interface PageMeta {
  page: number; limit: number; totalItems: number; totalPages: number;
  hasNextPage: boolean; hasPreviousPage: boolean;
}
export interface Page<T> { items: T[]; meta: PageMeta }

export interface WalletSummary { id: string; tokenBalance: number; fiatBalance: string; status: WalletStatus }
export interface UserProfile {
  id: string; email: string; username: string; role: UserRole;
  bio?: string | null; avatarUrl?: string | null;
  isVerified: boolean; isActive: boolean; createdAt: string; wallet?: WalletSummary;
}
export interface UpdateMyProfileInput {
  bio?: string;
  avatarUrl?: string;
}
export interface AuthResponse {
  accessToken: string; refreshToken: string; expiresInSeconds: number; user: UserProfile;
}
export interface Wallet {
  id: string; userId: string; tokenBalance: number; fiatBalance: string; status: WalletStatus;
  canRequestVerification: boolean; verificationCost: number; updatedAt: string;
}
export interface WalletTransaction {
  id: string; walletId: string; type: TransactionType; tokensAmount: number; fiatAmount: string;
  balanceAfter: number; referenceType: 'STORE_ORDER' | 'POST' | 'SYSTEM'; referenceId: string | null;
  description: string; createdAt: string;
}
export interface Category { id: string; name: string; slug: string; description: string | null }
export interface PostSource { id: string; title: string; url: string; publisher: string; isReliable: boolean }
export interface PostVerification {
  id: string; postId: string; reviewerId: string; verdict: VerificationStatus;
  notes: string; trustScore: number; reviewedAt: string;
}
export interface Post {
  id: string; authorId: string; authorUsername?: string; categoryId: string; categoryName?: string;
  organizationId?: string | null; organizationName?: string;
  title: string; slug: string; summary: string; content: string;
  coverImageUrl?: string | null;
  unlockPriceTokens?: number; isPremium?: boolean; isLocked?: boolean;
  slaDeadlineAt?: string | null; isSlaBreached?: boolean;
  status: PostStatus; verificationStatus: VerificationStatus;
  isVerified: boolean; verificationRequestedAt: string | null; verifiedAt: string | null;
  publishedAt: string | null; createdAt: string; updatedAt: string;
  sources: PostSource[]; verifications?: PostVerification[];
}
export interface TokenPackage {
  id: string; name: string; description: string; tokensAmount: number; bonusTokens: number;
  totalTokensPerUnit: number; estimatedVerificationsCount: number; price: string; currency: string;
  isActive: boolean; createdAt: string;
}
export interface StoreOrder {
  id: string; userId: string; packageId: string; packageName?: string; tokensGranted: number;
  totalPaid: string; currency: string; status: OrderStatus; paymentProvider: string;
  externalPaymentId: string | null; createdAt: string; completedAt: string | null;
}
export interface CheckoutSession {
  orderId: string; stripeSessionId: string; checkoutUrl: string; tokensToGrant: number;
  totalToPay: string; currency: string; status: OrderStatus;
}
export interface CreatePostInput {
  categoryId: string; title: string; summary: string; content: string;
  coverImageUrl?: string; organizationId?: string; unlockPriceTokens?: number;
  sources?: { title: string; url: string; publisher: string }[];
}
export type UpdatePostInput = Partial<CreatePostInput> & { acknowledgeBadgeLoss?: boolean };
export interface AuthorProfile {
  id: string; username: string; bio?: string | null; avatarUrl?: string | null;
  memberSince: string; publishedPosts: number; verifiedPosts: number;
  rejectedPosts: number; averageTrustScore: number | null; verificationRate: number | null;
  followersCount?: number; isFollowedByMe?: boolean;
}
export interface AuthorFollowStatus {
  authorId: string; username: string; avatarUrl?: string | null; bio?: string | null;
  following: boolean; followersCount: number;
}
export interface AuthorAnalytics {
  totalPosts: number; publishedPosts: number; verifiedPosts: number;
  rejectedPosts: number; pendingVerificationPosts: number;
  verificationRate: number | null; averageTrustScore: number | null;
  followersCount: number; tipsReceivedCount: number; tipsTokensEarned: number;
  premiumUnlocksCount: number; premiumTokensEarned: number; totalTokensEarned: number;
}
export interface PostComment {
  id: string; postId: string; authorId: string; authorUsername?: string; authorAvatarUrl?: string | null;
  content: string; sourceUrl: string | null; isCorrectionRequest: boolean; isResolved: boolean; createdAt: string;
}
export interface CreatePostCommentInput {
  content: string; sourceUrl?: string; isCorrectionRequest?: boolean;
}
export interface OrganizationMember {
  id: string; organizationId: string; userId: string; username?: string; role: OrganizationRole; createdAt: string;
}
export interface Organization {
  id: string; name: string; slug: string; bio: string | null;
  websiteUrl: string | null; logoUrl: string | null; ownerId: string;
  isVerifiedBrand: boolean; createdAt: string; members?: OrganizationMember[];
}
export interface CreateOrganizationInput {
  name: string; bio?: string; websiteUrl?: string; logoUrl?: string;
}
export interface AddOrganizationMemberInput {
  username: string; role: OrganizationRole;
}
export interface TipResult {
  postId: string; tokensSent: number; tokensReceivedByAuthor: number; platformFee: number; balanceAfter: number;
}
export interface UnlockPostResult {
  postId: string; tokensPaid: number; tokensReceivedByAuthor: number; platformFee: number; balanceAfter: number;
}
export interface VerifyPostInput {
  verdict: Exclude<VerificationStatus, 'PENDING'>; notes: string; trustScore: number; refundTokens?: boolean;
}

export type DomainTrustTier = 'HIGH_TRUST' | 'STANDARD' | 'SHORTENER_OR_RISKY';
export interface SourcePrecheckItem {
  sourceId: string; title: string; url: string; publisher: string; domain: string;
  domainTier: DomainTrustTier; reachable: boolean; httpStatus: number | null;
  titleMatchInPage: boolean | null; isReliable: boolean; reason: string;
}
export interface PostSourcesPrecheckReport {
  postId: string; checkedAt: string; totalSources: number; reliableCount: number;
  unreachableCount: number; suggestedTrustScore: number; sources: SourcePrecheckItem[];
}
export interface PostCertificate {
  postId: string; slug: string; title: string; authorUsername?: string; categoryName?: string;
  status: 'VERIFIED'; verifiedAt: string | null; publishedAt: string | null;
  trustScore: number | null; reviewNotes: string | null; sources: PostSource[];
}

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
export interface PayoutSummary {
  kycStatus: KycStatus; payoutDestination: string | null; availableTokens: number; availableAmount: string;
  maturingTokens: number; minPayoutTokens: number; centsPerToken: number; currency: string; holdDays: number;
}
export interface Withdrawal {
  id: string; tokensAmount: number; payoutAmount: string; currency: string; status: WithdrawalStatus; destination: string;
  externalReference: string | null; rejectionReason: string | null; createdAt: string; reviewedAt: string | null; paidAt: string | null;
  userId?: string; username?: string;
}

export interface AdminKycItem {
  userId: string; username?: string; email?: string; kycStatus: KycStatus;
  payoutDestination: string | null; kycReference?: string | null; updatedAt?: string;
}

export interface CreatePackageInput {
  name: string; description: string; tokensAmount: number; bonusTokens: number; price: number; currency: string;
}

export interface CreateCategoryInput {
  name: string; description?: string;
}

export interface GrantBonusInput {
  userId: string; tokensAmount: number; reason: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}
