import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Shield,
  ShieldCheck,
  Check,
  X,
  MapPin,
  Crown,
  Camera,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { SubscriptionPlansSection } from './Subscription';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cycleLength: '28',
    lastPeriod: new Date().toISOString().split('T')[0],
  });

  // ---------------------------------------------
  // USER DATA
  // ---------------------------------------------
  useEffect(() => {
    if (user) {
      setFormData({
        name:
          user.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          '',
        email: user.email || '',
        cycleLength: user.cycle_length || '28',
        lastPeriod: user.last_period_date
          ? new Date(user.last_period_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [user]);

  // ---------------------------------------------
  // HANDLE INPUT CHANGE
  // ---------------------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------------------------------------
  // SAVE PROFILE
  // ---------------------------------------------
  const handleSave = async () => {
    if (updateUser) {
      await updateUser({
        name: formData.name,
        email: formData.email,
        cycle_length: parseInt(formData.cycleLength),
        last_period_date: formData.lastPeriod,
      });
    }

    setIsEditing(false);
  };

  // ---------------------------------------------
  // CANCEL EDIT
  // ---------------------------------------------
  const handleCancel = () => {
    setFormData({
      name:
        user?.name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        '',
      email: user?.email || '',
      cycleLength: user?.cycle_length || '28',
      lastPeriod: user?.last_period_date
        ? new Date(user.last_period_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });

    setIsEditing(false);
  };

  // ---------------------------------------------
  // DISPLAY VALUES
  // ---------------------------------------------
  const displayName =
    formData.name ||
    user?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'User';

  const initials = displayName
    ?.split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedPeriodDate = formData.lastPeriod
    ? new Date(formData.lastPeriod).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not available';

  const isPaidActive = Boolean(
    user?.is_premium &&
    (user?.subscription === 'monthly' || user?.subscription === 'annual' || user?.subscriptionPlan) &&
    (!user?.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt).getTime() > Date.now())
  );

  const planText = isPaidActive
    ? user?.subscription === 'annual'
      ? 'Annual Plan (Active)'
      : user?.subscription === 'monthly'
      ? 'Monthly Plan (Active)'
      : 'Premium Plan (Active)'
    : 'Free Plan';

  return (
    <div className="min-h-[calc(100vh-70px)] w-full bg-[#faf9fb] px-5 py-8 md:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-[1700px]">

        {/* =========================================================
            MAIN PROFILE GRID
        ========================================================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(350px,0.78fr)_minmax(650px,1.55fr)]">

          {/* =======================================================
              LEFT PROFILE CARD
          ======================================================= */}
          <section
            className="
              relative
              flex
              min-h-[650px]
              flex-col
              overflow-hidden
              rounded-[28px]
              border
              border-[#eee9ef]
              bg-white
              px-8
              py-8
              shadow-[0_8px_35px_rgba(40,31,55,0.045)]
              md:px-10
              md:py-9
            "
          >

            {/* Camera Button */}
            <button
              type="button"
              className="
                absolute
                right-7
                top-7
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-[#f2d9e7]
                bg-white
                text-[#1b2a49]
                shadow-[0_4px_14px_rgba(40,31,55,0.05)]
                transition-all
                duration-200
                hover:border-[#ef6b9b]
                hover:text-[#ef5c91]
                hover:shadow-md
              "
              aria-label="Change profile picture"
            >
              <Camera className="h-5 w-5" strokeWidth={1.8} />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col items-center pt-2">

              {/* Name */}
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                  className="
                    mt-1
                    w-full
                    max-w-[330px]
                    border-b-2
                    border-[#ef6b9b]
                    bg-transparent
                    px-1
                    text-center
                    text-[30px]
                    font-bold
                    tracking-[-0.02em]
                    text-[#172b4d]
                    outline-none
                  "
                />
              ) : (
                <h1
                  className="
                    mt-1
                    text-center
                    text-[32px]
                    font-bold
                    tracking-[-0.025em]
                    text-[#172b4d]
                  "
                >
                  {displayName}
                </h1>
              )}

              {/* Plan Badge */}
              <div
                className={`
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  text-[14px]
                  font-semibold
                  ${isPaidActive ? 'bg-[#e6f8ef] text-[#15965c]' : 'bg-[#f0f1f5] text-[#5e6978]'}
                `}
              >
                {isPaidActive ? (
                  <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={2} />
                ) : (
                  <Shield className="h-[17px] w-[17px]" strokeWidth={1.8} />
                )}
                {planText}
              </div>
            </div>

            {/* =====================================================
                AVATAR
            ===================================================== */}
            <div className="flex flex-1 items-center justify-center py-8">

              <div
                className="
                  relative
                  flex
                  h-[330px]
                  w-[330px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-[8px]
                  border-white
                  bg-[#f5e4ec]
                  shadow-[0_10px_35px_rgba(35,25,45,0.10)]
                  ring-1
                  ring-[#eee4eb]
                "
              >

                {/* FemCare avatar asset with fallback */}
                <img
                  src="/images/kashish-avatar.png"
                  alt={displayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />

                {/* Fallback avatar */}
                <div
                  className="
                    absolute
                    inset-0
                    hidden
                    items-center
                    justify-center
                    bg-[#f4dfe9]
                    text-[82px]
                    font-semibold
                    text-[#ef5c91]
                  "
                >
                  {initials || 'K'}
                </div>
              </div>
            </div>

            {/* Health Message */}
            <div
              className="
                mx-auto
                mb-3
                flex
                w-full
                max-w-[520px]
                items-center
                justify-center
                gap-2
                rounded-[16px]
                border
                border-[#f3dce7]
                bg-[#fff8fb]
                px-6
                py-5
                text-center
              "
            >
              <span
                className="
                  text-[17px]
                  font-medium
                  tracking-[-0.01em]
                  text-[#66748f]
                "
              >
                Your health journey matters
              </span>

              <span className="text-[21px] text-[#ef5c91]">
                ♥
              </span>
            </div>
          </section>


          {/* =======================================================
              RIGHT DETAILS CARD
          ======================================================= */}
          <section
            className="
              flex
              min-h-[650px]
              flex-col
              rounded-[28px]
              border
              border-[#eee9ef]
              bg-white
              p-7
              shadow-[0_8px_35px_rgba(40,31,55,0.045)]
              md:p-8
              lg:p-9
            "
          >

            {/* Header */}
            <div className="flex items-start justify-between gap-5">

              <h2
                className="
                  text-[28px]
                  font-bold
                  tracking-[-0.025em]
                  text-[#172b4d]
                  md:text-[30px]
                "
              >
                Bio &amp; Other Details
              </h2>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#f2a6c3]
                    bg-white
                    px-5
                    py-2.5
                    text-[14px]
                    font-semibold
                    text-[#d92e63]
                    transition-all
                    duration-200
                    hover:bg-[#fff5f8]
                    hover:shadow-sm
                  "
                >
                  <Edit3 className="h-4 w-4" strokeWidth={2} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex shrink-0 gap-2">

                  <button
                    onClick={handleCancel}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[#e5e5e8]
                      bg-[#fafafa]
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-[#667085]
                      transition-all
                      hover:border-red-200
                      hover:bg-red-50
                      hover:text-red-500
                    "
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-[#172b4d]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition-all
                      hover:bg-[#223b64]
                    "
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </button>

                </div>
              )}
            </div>


            {/* =====================================================
                INFORMATION GRID
            ===================================================== */}
            <div className="mt-7 grid grid-cols-1 md:grid-cols-2">

              {/* EMAIL */}
              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-5
                  border-b
                  border-[#eeeef1]
                  py-5
                  md:pr-7
                  md:border-r
                "
              >
                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#fff0f5]
                    text-[#e83f72]
                  "
                >
                  <Mail className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-[#71809b]">
                    Email Address
                  </p>

                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="
                        mt-1
                        w-full
                        border-b
                        border-gray-300
                        bg-transparent
                        pb-1
                        text-[17px]
                        font-semibold
                        text-[#172b4d]
                        outline-none
                        focus:border-[#ef5c91]
                      "
                    />
                  ) : (
                    <p className="mt-1 truncate text-[17px] font-semibold text-[#172b4d]">
                      {formData.email}
                    </p>
                  )}
                </div>
              </div>


              {/* CYCLE LENGTH */}
              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-5
                  border-b
                  border-[#eeeef1]
                  py-5
                  md:pl-7
                "
              >
                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#eaf9f5]
                    text-[#13a58d]
                  "
                >
                  <Calendar className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-[15px] font-medium text-[#71809b]">
                    Average Cycle Length
                  </p>

                  {isEditing ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        name="cycleLength"
                        value={formData.cycleLength}
                        onChange={handleChange}
                        className="
                          w-[70px]
                          border-b
                          border-gray-300
                          bg-transparent
                          pb-1
                          text-[17px]
                          font-semibold
                          text-[#172b4d]
                          outline-none
                          focus:border-[#ef5c91]
                        "
                      />
                      <span className="text-[16px] text-[#71809b]">
                        Days
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[18px] font-semibold text-[#172b4d]">
                      {formData.cycleLength} Days
                    </p>
                  )}
                </div>
              </div>


              {/* LAST PERIOD */}
              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-5
                  border-b
                  border-[#eeeef1]
                  py-5
                  md:pr-7
                  md:border-r
                "
              >
                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f2efff]
                    text-[#7556d8]
                  "
                >
                  <Calendar className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-[#71809b]">
                    Last Period Date
                  </p>

                  {isEditing ? (
                    <input
                      type="date"
                      name="lastPeriod"
                      value={formData.lastPeriod}
                      onChange={handleChange}
                      className="
                        mt-1
                        w-full
                        border-b
                        border-gray-300
                        bg-transparent
                        pb-1
                        text-[17px]
                        font-semibold
                        text-[#172b4d]
                        outline-none
                        focus:border-[#ef5c91]
                      "
                    />
                  ) : (
                    <p className="mt-1 text-[17px] font-semibold text-[#172b4d]">
                      {formattedPeriodDate}
                    </p>
                  )}
                </div>
              </div>


              {/* ROLE + AGE */}
              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-5
                  border-b
                  border-[#eeeef1]
                  py-5
                  md:pl-7
                "
              >
                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#fff3e9]
                    text-[#e98625]
                  "
                >
                  <Crown className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-[15px] font-medium text-[#71809b]">
                    My Role
                  </p>

                  <p className="mt-1 text-[18px] font-semibold text-[#172b4d]">
                    User
                  </p>

                  {/* AGE IS DIRECTLY UNDER USER */}
                  <p className="mt-1 text-[16px] font-medium text-[#71809b]">
                    {user?.age ? `Age ${user.age}` : 'Age 20'}
                  </p>
                </div>
              </div>


              {/* CITY */}
              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-5
                  py-5
                  md:pr-7
                "
              >
                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#fff0f2]
                    text-[#ed5363]
                  "
                >
                  <MapPin className="h-6 w-6" strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-[15px] font-medium text-[#71809b]">
                    My City or Region
                  </p>

                  <p className="mt-1 text-[17px] font-semibold text-[#172b4d]">
                    Vadodara, Gujarat, India
                  </p>
                </div>
              </div>


              {/* EMPTY RIGHT GRID SPACE */}
              <div className="hidden md:block" />

            </div>


            {/* =====================================================
                MY PLAN
            ===================================================== */}
            <div
              className="
                mt-auto
                rounded-[20px]
                border
                border-[#f4dce8]
                bg-gradient-to-r
                from-[#fff7fa]
                to-[#fdf9fc]
                p-5
                md:p-6
              "
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-4">

                  {/* Crown Icon */}
                  <div
                    className="
                      flex
                      h-[58px]
                      w-[58px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#fff0f5]
                      text-[#e53f72]
                    "
                  >
                    <Crown className="h-6 w-6" strokeWidth={1.8} />
                  </div>

                  {/* Plan Details */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-[18px] font-bold text-[#172b4d]">
                        My Plan
                      </h3>

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-3
                          py-1
                          text-[13px]
                          font-semibold
                          ${isPaidActive ? 'bg-[#e5f8ed] text-[#14945a]' : 'bg-[#f0f1f5] text-[#5e6978]'}
                        `}
                      >
                        {isPaidActive ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        {planText}
                      </span>

                    </div>

                    <p className="mt-2 text-[14px] leading-6 text-[#71809b]">
                      {isPaidActive
                        ? `Unlimited access to all clinical insights, doctor appointments, cycle analyses, and AI health assistance.${user?.subscriptionExpiresAt ? ` Active until ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}.` : ''}`
                        : 'Currently on Free Plan. Access basic tracking, period predictions, and educational overviews. Upgrade to unlock full clinical guides.'}
                    </p>
                  </div>
                </div>


                {/* VIEW PLANS BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    justify-center
                    gap-3
                    rounded-full
                    border
                    border-[#f2a6c3]
                    bg-white
                    px-6
                    py-3
                    text-[15px]
                    font-semibold
                    text-[#d92e63]
                    transition-all
                    duration-200
                    hover:bg-[#fff5f8]
                    hover:shadow-md
                  "
                >
                  View Plans
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>

              </div>
            </div>

          </section>
        </div>

        {/* =========================================================
            SUBSCRIPTION PLANS SECTION EMBEDDED IN PROFILE
        ========================================================= */}
        <div id="subscription-plans" className="mt-10 border-t border-[#eee9ef] pt-4">
          <SubscriptionPlansSection />
        </div>

        {/* =========================================================
            LOGOUT
        ========================================================= */}
        <div className="mt-5 flex justify-end px-2">
          <button
            onClick={handleLogout}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-red-200
              bg-white
              px-6
              py-2.5
              text-[14px]
              font-semibold
              text-red-500
              shadow-sm
              transition-all
              duration-200
              hover:bg-red-50
              hover:border-red-400
              hover:text-red-600
              hover:shadow-md
            "
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
