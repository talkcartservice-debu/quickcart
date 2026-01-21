// Safe router utility for SSR compatibility
let routerInstance = null;

export const getRouter = async () => {
  if (typeof window === 'undefined') {
    return null; // No router available during SSR
  }
  
  try {
    if (!routerInstance) {
      const { useRouter } = await import('next/navigation');
      routerInstance = useRouter();
    }
    return routerInstance;
  } catch (error) {
    console.warn('Could not get router:', error.message);
    return null;
  }
};

export const safePush = async (path) => {
  try {
    const router = await getRouter();
    if (router && router.push) {
      router.push(path);
    } else {
      // Fallback for SSR or if router isn't available
      window.location.href = path;
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};