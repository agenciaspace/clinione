// Utility functions for subdomain handling

export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // For clini.one or www.clini.one
  if (parts.length <= 2 || parts[0] === 'www') {
    return null;
  }
  
  // Return the subdomain (first part)
  return parts[0];
};

export const isSubdomain = (): boolean => {
  return getSubdomain() !== null;
};

export const getClinicSlugFromSubdomain = (): string | null => {
  return getSubdomain();
};

export const buildClinicSubdomainUrl = (slug: string): string => {
  const baseUrl = window.location.protocol + '//' + window.location.host.replace(/^[^.]+\./, '');
  return `${window.location.protocol}//${slug}.${baseUrl.replace(/^https?:\/\//, '')}`;
};