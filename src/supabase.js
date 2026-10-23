import { createClient } from '@supabase/supabase-js';

// Default initial data for Ajay Electricals (Karvenagar, Pune)
export const DEFAULT_SETTINGS = {
  shop_name: 'Ajay Electricals',
  tagline: 'Sales, Repairs & Fast Doorstep Electrical Services in Pune',
  phone_emergency: '7666184280',
  phone_whatsapp: '7666184280',
  phone_alt: '9673681767',
  address: 'Ajay electricals ,Canol Road, Lane No. 7, Karvenagar, Pune, Maharashtra 411052',
  hours: 'Shop open: 9:00 AM – 10:30 PM (24/7 Emergency Service On-Call)',
  upi_id: 'ajayelectricals@okaxis',
  instagram_url: 'https://instagram.com/ajay.electricals.contractors',
  instagram_handle: '@ajay.electricals.contractors',
  banner_message: '⚡ 24-hour emergency electrical service available in Karvenagar & Pune. Call +91 7666184280',
  payment_info: 'UPI: ajayelectricals@okaxis / GPay / PhonePe\nBank: Ajay Electricals, Current A/C\nCash upon technician visit is also accepted.',
  show_emergency_btn: true
};

export const DEFAULT_SERVICES = [
  { id: 'svc-fan', icon: '🌀', title: 'Fan Repair & Fitting', category: 'repair', price: 'From ₹150', estimated_duration: '30-45 mins', desc: 'Ceiling, exhaust, table & pedestal fans bearing, coil rewinding, capacitor & regulator replacement.' },
  { id: 'svc-mixer', icon: '🍹', title: 'Mixer Grinder Repair', category: 'repair', price: 'From ₹200', estimated_duration: '45 mins', desc: 'Motor repair, carbon brush change, jar coupler, blade replacement and heavy-duty rewinding.' },
  { id: 'svc-geyser', icon: '🚿', title: 'Geyser & Water Heater', category: 'repair', price: 'From ₹250', estimated_duration: '45-60 mins', desc: 'Instant & storage geysers element replacement, thermostat tuning, leakage fixes & coil replacement.' },
  { id: 'svc-wiring', icon: '🔌', title: 'House & Flat Wiring', category: 'wiring', price: 'Free site survey', estimated_duration: '1-3 days', desc: 'Concealed & surface wiring, MCB distribution board setup, short-circuit troubleshooting & renovations.' },
  { id: 'svc-install', icon: '🛠️', title: 'Appliance & Fitting', category: 'installation', price: 'From ₹120', estimated_duration: '30 mins', desc: 'Chandeliers, LED profile lights, fancy switches, inverter setup, doorbell and heavy appliance wiring.' },
  { id: 'svc-society', icon: '🏢', title: 'Society Maintenance (AMC)', category: 'maintenance', price: 'Custom AMC', estimated_duration: 'Ongoing', desc: 'Residential societies, pump motor control panels, elevator power, staircase & common area lighting.' },
  { id: 'svc-cctv', icon: '📹', title: 'CCTV Sales & Installation', category: 'security', price: 'Get a quote', estimated_duration: 'Same day', desc: 'HD & IP security cameras, 4/8/16-channel DVR/NVR, remote phone live view configuration & AMC.' },
  { id: 'svc-dishtv', icon: '📡', title: 'DishTV / DTH Sales & Setup', category: 'installation', price: 'From ₹299', estimated_duration: '45 mins', desc: 'Tata Play, Airtel, Dish TV new dish connection, signal alignment, wire replacement & STB repair.' }
];

export const DEFAULT_PRODUCTS = [
  { id: 'prd-led-light', title: 'Havells 20W Cool Day LED Tube Batten', category: 'lighting', brand: 'Havells', price: 320, mrp: 480, in_stock: true, warranty: '2 Years', badge: 'Best Seller', description: 'High lumen, glare-free, energy-efficient batten light with 4kV surge protection.' },
  { id: 'prd-fan-crompton', title: 'Crompton High-Speed 1200mm Ceiling Fan', category: 'appliances', brand: 'Crompton', price: 1850, mrp: 2490, in_stock: true, warranty: '2 Years', badge: 'Popular', description: '100% pure copper motor, high air delivery, anti-dust coating.' },
  { id: 'prd-mcb-anchor', title: 'Anchor Panasonic Single Pole MCB C-Curve', category: 'switches', brand: 'Anchor', price: 160, mrp: 240, in_stock: true, warranty: '3 Years', badge: 'Safety Pick', description: 'Flame retardant housing, instant short circuit tripping protection.' },
  { id: 'prd-cctv-kit', title: 'CP Plus 4 Camera 2MP Full HD Combo Kit', category: 'security', brand: 'CP Plus', price: 8990, mrp: 12500, in_stock: true, warranty: '2 Years', badge: 'Complete Kit', description: 'Includes DVR, 4 night-vision bullet/dome cameras, 1TB hard drive & cables.' },
  { id: 'prd-wire-polycab', title: 'Polycab 1.5 sq mm FR Copper Wire (90m)', category: 'wires', brand: 'Polycab', price: 1780, mrp: 2350, in_stock: true, warranty: 'ISI Certified', badge: 'Top Quality', description: 'Heat resistant, oxygen free copper conductor wire ideal for home electrification.' },
  { id: 'prd-geyser-instant', title: 'Bajaj 3L Flora Instant Water Heater', category: 'appliances', brand: 'Bajaj', price: 2890, mrp: 4100, in_stock: true, warranty: '2 Years', badge: 'Hot Deal', description: 'Rust-proof thermoplastic body, fire-retardant cable with neon power indicators.' }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'ae-001',
    booking_code: 'AE-4182',
    customer_name: 'Rajesh Kulkarni',
    customer_phone: '9822012345',
    service_name: 'Geyser & Water Heater',
    address: 'Flat 402, Sai Shraddha Apts, Karvenagar',
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_slot: 'Morning (9 AM - 12 PM)',
    urgency: 'Standard',
    problem_details: 'Geyser is tripping the MCB switch immediately when turned on.',
    status: 'Pending',
    estimated_cost: 350,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ae-002',
    booking_code: 'AE-7391',
    customer_name: 'Pooja Deshmukh',
    customer_phone: '9890123456',
    service_name: 'Fan Repair & Fitting',
    address: 'Bunglow 12, Swapnanagari, Canol Road',
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_slot: 'Afternoon (12 PM - 4 PM)',
    urgency: 'Urgent',
    problem_details: 'Ceiling fan making rattling noise and speed has slowed down.',
    status: 'Confirmed',
    estimated_cost: 200,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'ae-003',
    booking_code: 'AE-8920',
    customer_name: 'Amit Shinde',
    customer_phone: '9765432100',
    service_name: 'House & Flat Wiring',
    address: 'Shop 3, Near Cummins College, Karvenagar',
    preferred_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    preferred_slot: 'Morning (9 AM - 12 PM)',
    urgency: 'Standard',
    problem_details: 'New retail store concealed wiring and AC line point wiring.',
    status: 'In progress',
    estimated_cost: 2800,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'ae-004',
    booking_code: 'AE-2345',
    customer_name: 'Society Secy - Shanti Niwas',
    customer_phone: '9922883344',
    service_name: 'Society Maintenance (AMC)',
    address: 'Shanti Niwas CHS, Lane 7 Karvenagar',
    preferred_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    preferred_slot: 'Morning (9 AM - 12 PM)',
    urgency: 'Standard',
    problem_details: 'Society parking auto sensor lights replaced and pump starter checked.',
    status: 'Completed',
    estimated_cost: 1200,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Supabase Connection Manager
class BackendManager {
  constructor() {
    this.supabase = null;
    this.isSupabaseConnected = false;
    this.currentUser = null;
    this.listeners = [];
    this.authListeners = [];
    this.init();
  }

  async init() {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const storedUrl = localStorage.getItem('ajay_supabase_url');
    const storedKey = localStorage.getItem('ajay_supabase_key');

    const rawUrl = storedUrl || envUrl || 'https://nbtcsdvusomvcsblcpyo.supabase.co';
    const url = this.normalizeUrl(rawUrl);
    const key = storedKey || envKey || 'sb_publishable_jw7iGki_CHaobuiT1SHGnA_5TnuHdHJ';

    if (url && key && url.startsWith('http')) {
      try {
        this.supabase = createClient(url, key);
        this.isSupabaseConnected = true;
        console.log('⚡ Connected to Supabase Cloud:', url);
        this.setupRealtime();
        await this.checkInitialSession();
        this.setupAuthListener();
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        this.isSupabaseConnected = false;
      }
    } else {
      console.log('ℹ️ Running in Local Storage Mode (Ready for Supabase credentials)');
    }

    // Check cached local auth session if Supabase was not used
    if (!this.currentUser) {
      const cached = localStorage.getItem('ajay_admin_session');
      if (cached) {
        try {
          this.currentUser = JSON.parse(cached);
        } catch (e) {
          // ignore corrupted cache
        }
      }
    }

    this.ensureLocalSeed();
  }

  async checkInitialSession() {
    if (!this.supabase) return;
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (!error && session && session.user) {
        this.currentUser = session.user;
        localStorage.setItem('ajay_admin_session', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          type: 'supabase'
        }));
        this.notifyAuthListeners();
      }
    } catch (err) {
      console.warn('Supabase session check error:', err);
    }
  }

  setupAuthListener() {
    if (!this.supabase) return;
    try {
      this.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = session.user;
          localStorage.setItem('ajay_admin_session', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            type: 'supabase'
          }));
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          localStorage.removeItem('ajay_admin_session');
        }
        this.notifyAuthListeners();
      });
    } catch (e) {
      console.warn('Auth state change listener setup failed:', e);
    }
  }

  // --- AUTHENTICATION API ---
  async signIn(loginId, password) {
    const trimmedId = (loginId || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, message: 'Please enter both login ID and password.' };
    }

    // 1. If Supabase is connected and login is an email, attempt real Supabase Auth
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: trimmedId,
          password: trimmedPass
        });

        if (!error && data?.user) {
          this.currentUser = data.user;
          localStorage.setItem('ajay_admin_session', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            type: 'supabase'
          }));
          this.notifyAuthListeners();
          return {
            success: true,
            user: data.user,
            type: 'supabase',
            message: `Welcome back, ${data.user.email}!`
          };
        }

        // If error was explicitly invalid credentials and it looks like an email, we report it
        if (error && trimmedId.includes('@')) {
          console.warn('Supabase Auth error:', error.message);
          // Fall through to allow emergency backup password check
        }
      } catch (err) {
        console.warn('Supabase Auth attempt error:', err);
      }
    }

    // 2. Check Manual / Local Admin credentials
    const savedUser = localStorage.getItem('ajay_admin_username') || 'admin';
    const savedPass = localStorage.getItem('ajay_admin_password') || 'admin123';
    const legacyPin = localStorage.getItem('ajay_admin_pin') || '1234';

    const isMatch =
      (trimmedId.toLowerCase() === savedUser.toLowerCase() && trimmedPass === savedPass) ||
      (trimmedId.toLowerCase() === 'admin' && (trimmedPass === 'admin123' || trimmedPass === legacyPin || trimmedPass === '1234')) ||
      (trimmedId.toLowerCase() === 'ajay' && (trimmedPass === 'ajay123' || trimmedPass === legacyPin));

    if (isMatch) {
      const localUser = {
        id: 'local-admin',
        email: trimmedId.includes('@') ? trimmedId : `${trimmedId}@ajayelectricals.local`,
        username: trimmedId,
        type: 'local'
      };
      this.currentUser = localUser;
      localStorage.setItem('ajay_admin_session', JSON.stringify(localUser));
      this.notifyAuthListeners();
      return {
        success: true,
        user: localUser,
        type: 'local',
        message: `Logged in as Admin (${trimmedId})`
      };
    }

    return {
      success: false,
      message: 'Invalid login ID or password. Please verify your Supabase Auth user or admin credentials.'
    };
  }

  async signOut() {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        await this.supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during Supabase signout:', err);
      }
    }
    this.currentUser = null;
    localStorage.removeItem('ajay_admin_session');
    this.notifyAuthListeners();
    return { success: true };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  onAuthChange(cb) {
    this.authListeners.push(cb);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== cb);
    };
  }

  notifyAuthListeners() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error(e); }
    });
  }

  setupRealtime() {
    if (!this.supabase) return;
    try {
      this.supabase
        .channel('public:bookings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          this.notifyListeners();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription not active:', e);
    }
  }

  ensureLocalSeed() {
    if (!localStorage.getItem('ajay_bookings')) {
      localStorage.setItem('ajay_bookings', JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem('ajay_services')) {
      localStorage.setItem('ajay_services', JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem('ajay_products')) {
      localStorage.setItem('ajay_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('ajay_settings')) {
      localStorage.setItem('ajay_settings', JSON.stringify(DEFAULT_SETTINGS));
    } else {
      // One-time migration of old default contact/instagram values to new ones.
      try {
        const raw = localStorage.getItem('ajay_settings');
        const s = JSON.parse(raw);
        const changed = {};
        if (s.phone_emergency === '9673681767') changed.phone_emergency = '7666184280';
        if (s.phone_whatsapp === '9673681767') changed.phone_whatsapp = '7666184280';
        if (s.phone_alt === '7666184280') changed.phone_alt = '9673681767';
        if (s.address === 'Canol Road, Lane No. 7, Karvenagar, Pune, Maharashtra 411052') changed.address = 'Ajay electricals ,Canol Road, Lane No. 7, Karvenagar, Pune, Maharashtra 411052';
        if (s.instagram_url === 'https://instagram.com/ajay_electricals') changed.instagram_url = 'https://instagram.com/ajay.electricals.contractors';
        if (s.instagram_handle === '@ajay_electricals') changed.instagram_handle = '@ajay.electricals.contractors';
        if (s.banner_message === '⚡ 24-hour emergency electrical service available in Karvenagar & Pune! Call +91 9673681767') changed.banner_message = '⚡ 24-hour emergency electrical service available in Karvenagar & Pune. Call +91 7666184280';
        if (Object.keys(changed).length) {
          localStorage.setItem('ajay_settings', JSON.stringify({ ...s, ...changed }));
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }

  normalizeUrl(rawUrl) {
    if (!rawUrl) return '';
    return rawUrl.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  }

  async setSupabaseConfig(rawUrl, rawKey) {
    const url = this.normalizeUrl(rawUrl);
    const key = (rawKey || '').trim();

    if (!url || !key) {
      localStorage.removeItem('ajay_supabase_url');
      localStorage.removeItem('ajay_supabase_key');
      this.supabase = null;
      this.isSupabaseConnected = false;
      return { success: true, message: 'Switched to Local Mode' };
    }

    try {
      const client = createClient(url, key);
      // Test basic query to verify connection
      const { data, error } = await client.from('shop_settings').select('shop_name').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table may not exist yet, but credentials might be valid
        console.warn('Supabase query note:', error.message);
      }
      localStorage.setItem('ajay_supabase_url', url);
      localStorage.setItem('ajay_supabase_key', key);
      this.supabase = client;
      this.isSupabaseConnected = true;
      this.setupRealtime();
      await this.checkInitialSession();
      this.setupAuthListener();
      return { success: true, message: 'Connected successfully to Supabase!' };
    } catch (err) {
      return { success: false, message: err.message || 'Could not connect to Supabase' };
    }
  }

  getSupabaseConfig() {
    const storedUrl = localStorage.getItem('ajay_supabase_url');
    const storedKey = localStorage.getItem('ajay_supabase_key');
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return {
      url: this.normalizeUrl(storedUrl || envUrl || 'https://nbtcsdvusomvcsblcpyo.supabase.co'),
      key: storedKey || envKey || 'sb_publishable_jw7iGki_CHaobuiT1SHGnA_5TnuHdHJ',
      isConnected: this.isSupabaseConnected
    };
  }

  onBookingsChange(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  // --- BOOKINGS API ---
  async getBookings() {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          // Sync to local cache
          localStorage.setItem('ajay_bookings', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Falling back to local storage for bookings:', err);
      }
    }
    const raw = localStorage.getItem('ajay_bookings');
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  }

  async createBooking(bookingData) {
    const code = 'AE-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      booking_code: code,
      customer_name: bookingData.name.trim(),
      customer_phone: bookingData.phone.replace(/\D/g, '').slice(-10),
      service_name: bookingData.service,
      service_category: bookingData.category || 'repair',
      address: bookingData.address.trim(),
      preferred_date: bookingData.date,
      preferred_slot: bookingData.slot,
      urgency: bookingData.urgency || 'Standard',
      problem_details: bookingData.problem ? bookingData.problem.trim() : '',
      status: 'Pending',
      estimated_cost: bookingData.cost || 0,
      created_at: new Date().toISOString()
    };

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('bookings')
          .insert([newBooking])
          .select()
          .single();
        if (!error && data) {
          this.notifyListeners();
          return { success: true, booking: data };
        }
        console.warn('Supabase insert error, saving locally:', error);
      } catch (err) {
        console.warn('Supabase insert failed, saving locally:', err);
      }
    }

    // Save locally
    const current = await this.getBookings();
    const withId = { ...newBooking, id: 'loc-' + Date.now() };
    const updated = [withId, ...current];
    localStorage.setItem('ajay_bookings', JSON.stringify(updated));
    this.notifyListeners();
    return { success: true, booking: withId };
  }

  async updateBookingStatus(code, newStatus, technician = null, notes = null) {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const payload = { status: newStatus, updated_at: new Date().toISOString() };
        if (technician !== null) payload.assigned_technician = technician;
        if (notes !== null) payload.admin_notes = notes;

        const { error } = await this.supabase
          .from('bookings')
          .update(payload)
          .eq('booking_code', code);
        if (!error) {
          this.notifyListeners();
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase update failed, updating locally:', err);
      }
    }

    const current = await this.getBookings();
    const updated = current.map(b => {
      if (b.booking_code === code) {
        return {
          ...b,
          status: newStatus,
          assigned_technician: technician !== null ? technician : b.assigned_technician,
          admin_notes: notes !== null ? notes : b.admin_notes
        };
      }
      return b;
    });
    localStorage.setItem('ajay_bookings', JSON.stringify(updated));
    this.notifyListeners();
    return { success: true };
  }

  async deleteBooking(code) {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        await this.supabase.from('bookings').delete().eq('booking_code', code);
      } catch (e) {
        console.warn(e);
      }
    }
    const current = await this.getBookings();
    const updated = current.filter(b => b.booking_code !== code);
    localStorage.setItem('ajay_bookings', JSON.stringify(updated));
    this.notifyListeners();
    return { success: true };
  }

  async trackBooking(code, phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanCode = code.trim().toUpperCase();

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('bookings')
          .select('*')
          .eq('booking_code', cleanCode)
          .maybeSingle();

        if (data && data.customer_phone.slice(-10) === cleanPhone) {
          return { success: true, booking: data };
        }
      } catch (err) {
        console.warn('Supabase track query error:', err);
      }
    }

    const list = await this.getBookings();
    const match = list.find(b =>
      b.booking_code.toUpperCase() === cleanCode &&
      b.customer_phone.replace(/\D/g, '').slice(-10) === cleanPhone
    );

    if (match) {
      return { success: true, booking: match };
    }
    return { success: false, message: 'No matching booking found. Please check your Booking ID and registered 10-digit mobile number.' };
  }

  // --- SERVICES API ---
  async getServices() {
    let remote = [];
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('services')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) remote = data;
      } catch (e) {
        console.warn(e);
      }
    }
    let local = [];
    try {
      const raw = localStorage.getItem('ajay_services');
      if (raw) local = JSON.parse(raw);
    } catch (e) { console.warn(e); }
    if (!local || !local.length) local = DEFAULT_SERVICES;

    // Merge by id; local edits/adds win (recovers items saved before fixes).
    const merged = new Map();
    for (const s of remote) merged.set(s.id, { ...s });
    for (const s of local) {
      const r = merged.get(s.id);
      merged.set(s.id, r ? { ...r, ...s } : { ...s });
    }
    let result = Array.from(merged.values());
    if (!result.length) result = DEFAULT_SERVICES;
    return result;
  }

  async saveService(service) {
    // Build a Supabase-safe payload (only known columns; map desc -> description).
    const dbColumns = ['id', 'title', 'category', 'icon', 'description', 'price', 'estimated_duration', 'is_featured', 'display_order'];
    const dbPayload = {};
    for (const key of dbColumns) {
      if (service[key] !== undefined) dbPayload[key] = service[key];
    }
    if (dbPayload.description === undefined) {
      dbPayload.description = service.desc || service.description || '';
    }
    if (!dbPayload.id) dbPayload.id = service.id;
    if (!dbPayload.icon) dbPayload.icon = service.icon || '⚡';

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { error } = await this.supabase.from('services').upsert([dbPayload]);
        if (error) console.warn('Supabase saveService error:', error.message);
      } catch (e) {
        console.warn('Supabase saveService failed:', e);
      }
    }

    // Persist full service (with desc) locally.
    let list = [];
    try {
      const raw = localStorage.getItem('ajay_services');
      if (raw) list = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    if (!list.length) list = [...DEFAULT_SERVICES];
    const idx = list.findIndex(s => s.id === service.id);
    let updated;
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = service;
    } else {
      updated = [...list, service];
    }
    localStorage.setItem('ajay_services', JSON.stringify(updated));
    return { success: true };
  }

  async deleteService(id) {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        await this.supabase.from('services').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    const list = await this.getServices();
    const updated = list.filter(s => s.id !== id);
    localStorage.setItem('ajay_services', JSON.stringify(updated));
    return { success: true };
  }

  // --- PRODUCTS (SALES) API ---
  async getProducts() {
    let remote = [];
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('products')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) remote = data;
      } catch (e) {
        console.warn(e);
      }
    }
    let local = [];
    try {
      const raw = localStorage.getItem('ajay_products');
      if (raw) local = JSON.parse(raw);
    } catch (e) { console.warn(e); }
    if (!local || !local.length) local = DEFAULT_PRODUCTS;

    const merged = new Map();
    for (const p of remote) merged.set(p.id, { ...p });
    for (const p of local) {
      const r = merged.get(p.id);
      merged.set(p.id, r ? { ...r, ...p } : { ...p });
    }
    let result = Array.from(merged.values());
    if (!result.length) result = DEFAULT_PRODUCTS;
    return result;
  }

  async saveProduct(product) {
    const dbColumns = ['id', 'title', 'category', 'brand', 'price', 'mrp', 'in_stock', 'warranty', 'badge', 'description', 'features', 'display_order'];
    const dbPayload = {};
    for (const key of dbColumns) {
      if (product[key] !== undefined) dbPayload[key] = product[key];
    }
    if (dbPayload.in_stock === undefined) dbPayload.in_stock = true;
    if (!dbPayload.id) dbPayload.id = product.id;

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { error } = await this.supabase.from('products').upsert([dbPayload]);
        if (error) console.warn('Supabase saveProduct error:', error.message);
      } catch (e) {
        console.warn('Supabase saveProduct failed:', e);
      }
    }

    let list = [];
    try {
      const raw = localStorage.getItem('ajay_products');
      if (raw) list = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    if (!list.length) list = [...DEFAULT_PRODUCTS];
    const idx = list.findIndex(p => p.id === product.id);
    let updated;
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = product;
    } else {
      updated = [...list, product];
    }
    localStorage.setItem('ajay_products', JSON.stringify(updated));
    return { success: true };
  }

  async deleteProduct(id) {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        await this.supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    const list = await this.getProducts();
    const updated = list.filter(p => p.id !== id);
    localStorage.setItem('ajay_products', JSON.stringify(updated));
    return { success: true };
  }

  // --- SETTINGS API ---
  async getSettings() {
    let remote = null;
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('shop_settings')
          .select('*')
          .eq('id', 'primary')
          .maybeSingle();
        if (!error && data) remote = data;
      } catch (e) {
        console.warn(e);
      }
    }
    let local = null;
    try {
      const raw = localStorage.getItem('ajay_settings');
      if (raw) local = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse local settings:', e);
    }
    // Merge: defaults < remote (Supabase) < local (latest user edits). Local wins.
    return { ...DEFAULT_SETTINGS, ...(remote || {}), ...(local || {}) };
  }

  async saveSettings(settings) {
    // Only send columns that exist in the shop_settings table to Supabase,
    // so extra fields (e.g. instagram_url/handle) don't break the whole upsert.
    const dbColumns = ['shop_name', 'tagline', 'phone_emergency', 'phone_whatsapp', 'phone_alt', 'address', 'hours', 'upi_id', 'banner_message', 'payment_info', 'show_emergency_btn'];
    const dbPayload = { id: 'primary', updated_at: new Date().toISOString() };
    for (const key of dbColumns) {
      if (settings[key] !== undefined) dbPayload[key] = settings[key];
    }

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { error } = await this.supabase
          .from('shop_settings')
          .upsert([dbPayload]);
        if (error) console.warn('Supabase saveSettings error:', error.message);
      } catch (e) {
        console.warn('Supabase saveSettings failed:', e);
      }
    }

    // Always persist the FULL settings (including instagram fields) locally.
    let current = {};
    try {
      const raw = localStorage.getItem('ajay_settings');
      if (raw) current = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    localStorage.setItem('ajay_settings', JSON.stringify({ ...current, ...settings }));
    return { success: true };
  }
}

export const dbManager = new BackendManager();
