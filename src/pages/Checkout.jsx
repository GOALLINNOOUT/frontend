import * as api from '../utils/api';
import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, TextField, Stack, Divider, Alert, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { LockOutlined, DescriptionOutlined, InfoOutlined } from '@mui/icons-material';

// Nigerian states and their local governments
const STATE_LGAS = {
  'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  'Adamawa': ['Demsa', 'Fufore', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
  'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  'Benue': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'],
  'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  'Edo': ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba-Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido-Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
  'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
  'FCT': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
  'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'],
  'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'],
  'Ondo': ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  'Osun': ['Aiyedaade', 'Aiyedire', 'Atakumosa East', 'Atakumosa West', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua an Pan', 'Riyom', 'Shendam', 'Wase'],
  'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi']
};

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Delivery fees per state (customize as needed)
const DELIVERY_FEES = {
  Lagos: 2000,
  'FCT': 2500,
  'Abuja': 2500, // in case Abuja is used
  'Ogun': 2200,
  'Oyo': 2200,
  'Rivers': 2500,
  'Kano': 2500,
  'Kaduna': 2500,
  // Default for all other states
  _default: 3000
};

function getDeliveryFee(state) {
  if (!state) return 0;
  return DELIVERY_FEES[state] || DELIVERY_FEES._default;
}

// Utility to get sessionId if it exists in localStorage
function getSessionId() {
  return localStorage.getItem('sessionId') || null;
}

function Checkout() {
  const { user } = useContext(AuthContext); // user is null if not signed in
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '', state: '', lga: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);
  const [showAutofillDialog, setShowAutofillDialog] = useState(false);
  const [autofillData, setAutofillData] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(!!user);
  const navigate = useNavigate();

  // Load Paystack script
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Improved auto-fill: fetch info only when email changes and is valid
  useEffect(() => {
    if (customer.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) {
      api.get(`/users/save-info?email=${encodeURIComponent(customer.email)}`)
        .then(res => {
          const data = res.data;
          if (data && data.name) {
            setCustomer(prev => ({
              name: prev.name || data.name || '',
              email: data.email || prev.email,
              phone: prev.phone || data.phone || '',
              address: data.address || prev.address,
              state: data.state || prev.state,
              lga: data.lga || prev.lga
            }));
          }
        });
    }
    
  }, [customer.email]);

  // On mount, check for localStorage autofill info
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('jc_closet_cart') || '[]');
    setCart(storedCart);
    if (!storedCart.length) {
      navigate('/cart');
    }
    // Check for local autofill info
    const localInfo = localStorage.getItem('jc_closet_customer_autofill');
    if (localInfo) {
      setAutofillData(JSON.parse(localInfo));
      setShowAutofillDialog(true);
    } else if (isSignedIn) {
      // If signed in, fetch backend autofill info; token sent via HTTP-only cookie
      api.get('/users/me', { credentials: 'include' })
        .then(res => {
          const data = res.data;
          if (data && (data.name || data.phone || data.address)) {
            setAutofillData(data);
            setShowAutofillDialog(true);
          }
        });
    }
  }, [navigate, isSignedIn]);

  // Handler for autofill dialog
  const handleAutofillAccept = () => {
    if (autofillData) {
      setCustomer(prev => ({
        ...prev,
        name: autofillData.name || prev.name,
        email: autofillData.email || prev.email,
        phone: autofillData.phone || prev.phone,
        address: autofillData.address || prev.address,
        state: autofillData.state || prev.state,
        lga: autofillData.lga || prev.lga
      }));
    }
    setShowAutofillDialog(false);
  };
  const handleAutofillDecline = () => {
    setShowAutofillDialog(false);
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('jc_closet_cart') || '[]');
    setCart(storedCart);
    if (!storedCart.length) {
      navigate('/cart');
    }
  }, [navigate]);

  const total = cart.reduce((sum, item) => {
    const now = new Date();
    let displayPrice = item.price;
    if (
      item.promoEnabled &&
      item.promoValue &&
      item.promoStart &&
      item.promoEnd &&
      new Date(item.promoStart) <= now &&
      new Date(item.promoEnd) >= now
    ) {
      if (item.promoType === 'discount') {
        displayPrice = Math.round(item.price * (1 - item.promoValue / 100));
      } else if (item.promoType === 'price') {
        displayPrice = item.promoValue;
      }
    }
    return sum + (displayPrice * (item.quantity || 1));
  }, 0);

  const deliveryFee = getDeliveryFee(customer.state);
  const grandTotal = total + deliveryFee;

  const validate = () => {
    const newErrors = {};
    if (!customer.name.trim()) newErrors.name = 'Name is required.';
    if (!customer.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) newErrors.email = 'Invalid email address.';
    if (!customer.phone.trim()) newErrors.phone = 'Phone is required.';
    else if (!/^\d{10,15}$/.test(customer.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid phone number.';
    if (!customer.state) newErrors.state = 'State is required.';
    if (customer.state && STATE_LGAS[customer.state] && !customer.lga) newErrors.lga = 'Local Government is required.';
    if (!customer.address.trim()) newErrors.address = 'Address is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setCustomer({ ...customer, state: value, lga: '' }); 
      setErrors({ ...errors, state: undefined, lga: undefined });
    } else {
      setCustomer({ ...customer, [name]: value });
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handlePay = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    // Check stock before payment
    try {
      const res = await api.post('/cart/check-stock', { items: cart.map(item => ({ _id: item._id, quantity: item.quantity })) });
      if (!res.data?.success) {
        setError(res.data?.message || 'Some items are out of stock or unavailable. Please review your cart.');
        setLoading(false);
        return;
      }
    } catch {
      setError('Could not verify stock. Please try again.');
      setLoading(false);
      return;
    }
    // Save email for future auto-fill
    localStorage.setItem('jc_closet_customer_email', customer.email);
    // Save info to localStorage for future autofill
    if (saveInfo) {
      localStorage.setItem('jc_closet_customer_autofill', JSON.stringify(customer));
      // Only send to backend if user is signed in
      if (user) {
        // Token sent via HTTP-only cookie
        api.post('/users/save-info', customer, { credentials: 'include' });
      }
    }
    // Only retrieve sessionId, do not generate if missing
    const sessionId = getSessionId();

    // Paystack payment
    const handler = window.PaystackPop && window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, // Use env variable
      email: customer.email,
      amount: grandTotal * 100, // kobo
      currency: 'NGN',
      ref: 'JC-' + Date.now(),
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'name', value: customer.name },
          { display_name: 'Phone', variable_name: 'phone', value: customer.phone },
          { display_name: 'State', variable_name: 'state', value: customer.state },
          { display_name: 'LGA', variable_name: 'lga', value: customer.lga },
          { display_name: 'Address', variable_name: 'address', value: customer.address },
          { display_name: 'Delivery Fee', variable_name: 'delivery_fee', value: deliveryFee },
        ]
      },
      callback: function(response) {
        // Save order to backend
        api.post('/orders', {
          cart,
          customer,
          paystackRef: response.reference,
          amount: total,
          deliveryFee,
          grandTotal,
          status: 'paid',
          paidAt: new Date().toISOString(),
          ...(sessionId ? { sessionId } : {})
        })
        .then(res => {
          const orderRes = res.data;
          Promise.all(
            cart.map(item =>
              api.post(`/perfumes/${item._id}/decrement-stock`, { quantity: item.quantity })
            )
          ).finally(() => {
            setSuccess(true);
            setLoading(false);
            localStorage.removeItem('jc_closet_cart');
            window.dispatchEvent(new Event('cart-updated'));
            setTimeout(() => navigate('/order-confirmation', {
              state: {
                wasAutoCreated: orderRes.wasAutoCreated,
                email: orderRes.email || customer.email
              }
            }), 500);
          });
        })
        .catch(() => {
          setError('Order saved failed, but payment was successful. Please contact support.');
          setLoading(false);
        });
      },
      onClose: function() {
        setLoading(false);
      }
    });
    if (handler) handler.openIframe();
    else setError('Paystack failed to load. Please try again.');
  };

  // Log checkout event when user lands on the checkout page
  useEffect(() => {
    const sessionId = getSessionId();
    if (sessionId) {
      api.post('/v1/checkout-events', { sessionId, user: user?._id });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setIsSignedIn(!!user);
  }, [user]);

  if (success) {
    // Instead of showing the inline success message, redirect is handled above
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | JC's Closet</title>
        <meta name="description" content="Complete your purchase securely at JC's Closet. Fast, safe, and easy checkout process." />
      </Helmet>
      <AnimatePresence>
        {showAutofillDialog && (
          <Dialog
            open={showAutofillDialog}
            onClose={handleAutofillDecline}
            TransitionComponent={motion.div}
            TransitionProps={{
              initial: { opacity: 0, y: -40 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 40 },
              transition: { duration: 0.5 }
            }}
            PaperProps={{
              sx: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                m: 0,
                p: 0,
                minWidth: { xs: '80vw', sm: 400 },
                maxWidth: '90vw',
                borderRadius: 3
              }
            }}
            aria-labelledby="autofill-dialog-title"
            aria-describedby="autofill-dialog-description"
          >
            <DialogTitle id="autofill-dialog-title">Auto-fill your details?</DialogTitle>
            <DialogContent id="autofill-dialog-description">
              <Typography>We found saved information. Would you like to auto-fill your details for faster checkout?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAutofillDecline} title="Decline autofill">No</Button>
              <Button onClick={handleAutofillAccept} variant="contained" title="Accept autofill">Yes, autofill</Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          maxWidth: { xs: '100%', sm: 500, md: 600 },
          mx: 'auto',
          mt: { xs: 2, sm: 4 },
          p: { xs: 1, sm: 2 },
          borderRadius: 3,
          boxShadow: { xs: 0, sm: 2 },
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h4" mb={2} fontWeight={700} textAlign="center" color="primary.main">
          Checkout
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" mb={1} color="text.secondary">Order Summary</Typography>
        <Stack spacing={1} mb={2} component={motion.div} initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
          {cart.map(item => (
            <motion.div key={item._id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" px={1} py={0.5} borderRadius={2} bgcolor="grey.100">
                <Typography fontWeight={500} fontSize={{ xs: 14, sm: 16 }}>{item.name} <span style={{ color: '#888' }}>x{item.quantity}</span></Typography>
                <Typography fontWeight={600} color="primary.main" fontSize={{ xs: 14, sm: 16 }}>
                  ₦{((item.promoEnabled && item.promoValue && item.promoStart && item.promoEnd && new Date(item.promoStart) <= new Date() && new Date(item.promoEnd) >= new Date())
                    ? (item.promoType === 'discount'
                      ? Math.round(item.price * (1 - item.promoValue / 100))
                      : item.promoType === 'price'
                        ? item.promoValue
                        : item.price)
                    : item.price
                  ).toLocaleString()}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Subtotal:</Typography>
          <Typography variant="h6" color="text.secondary">₦{total.toLocaleString()}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={1} color="text.secondary">Customer Information</Typography>
        <Stack spacing={2} mb={2}>
          <TextField label="Name" name="name" value={customer.name} onChange={handleInput} required error={!!errors.name} helperText={errors.name} fullWidth size="small" title="Enter your full name" />
          <TextField label="Email" name="email" value={customer.email} onChange={handleInput} required type="email" error={!!errors.email} helperText={errors.email} fullWidth size="small" title="Enter your email address" />
          <TextField label="Phone" name="phone" value={customer.phone} onChange={handleInput} required error={!!errors.phone} helperText={errors.phone} fullWidth size="small" title="Enter your phone number" />
          <TextField select label="State" name="state" value={customer.state} onChange={handleInput} required error={!!errors.state} helperText={errors.state} SelectProps={{ native: true }} fullWidth size="small" title="Select your state">
            <option value="">Select State</option>
            {NIGERIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </TextField>
          {customer.state && STATE_LGAS[customer.state] && (
            <TextField select label="Local Government" name="lga" value={customer.lga} onChange={handleInput} required error={!!errors.lga} helperText={errors.lga} SelectProps={{ native: true }} fullWidth size="small" title="Select your local government">
              <option value="">Select Local Government</option>
              {STATE_LGAS[customer.state].map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </TextField>
          )}
          <TextField label="Address" name="address" value={customer.address} onChange={handleInput} required multiline rows={2} error={!!errors.address} helperText={errors.address} fullWidth size="small" title="Enter your delivery address" />
          <FormControlLabel
            control={<Checkbox checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)} color="primary" title="Save my information for next time" />}
            label={<Typography fontSize={14}>Save my information for faster checkout next time</Typography>}
            sx={{ alignItems: 'flex-start' }}
          />
        </Stack>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Delivery Fee:</Typography>
          <Typography variant="h6" color="info.main">₦{deliveryFee.toLocaleString()}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={700}>Grand Total:</Typography>
          <Typography variant="h5" color="secondary.main" fontWeight={700}>₦{grandTotal.toLocaleString()}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Alert severity="error" sx={{ mb: 2 }}>{error || 'Order could not be saved. If payment was successful, please contact support.'}</Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <Box mt={2}>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handlePay}
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Pay for your order now"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </motion.div>
        </Box>
        <Divider sx={{ my: 3 }} />
        {/* Improved Info Section: visually appealing, accessible, and modern */}
        <Stack spacing={2} mb={2}>
          <Alert icon={<LockOutlined color="success" sx={{ fontSize: 22 }} />} severity="success" sx={{ alignItems: 'center', fontWeight: 500, bgcolor: 'success.lighter', color: 'success.dark' }}>
            Your payment and personal information are <b>encrypted and secure</b>.
          </Alert>
          <Alert icon={<DescriptionOutlined color="primary" sx={{ fontSize: 22 }} />} severity="info" sx={{ alignItems: 'center', bgcolor: 'info.lighter', color: 'info.dark' }}>
            By checking out, you agree to our
            <Button href="/terms" size="small" sx={{ textTransform: 'none', ml: 0.5, px: 0.5 }} target="_blank">Terms & Conditions</Button>
            and
            <Button href="/privacy" size="small" sx={{ textTransform: 'none', ml: 0.5, px: 0.5 }} target="_blank">Privacy Policy</Button>.
          </Alert>
          <Alert icon={<InfoOutlined color="info" sx={{ fontSize: 22 }} />} severity="info" sx={{ alignItems: 'center', bgcolor: 'info.lighter', color: 'info.dark' }}>
            <b>Delivery Assurance:</b> Orders are delivered within <b>2-5 business days</b> nationwide. You will receive tracking and status updates via email/SMS.
          </Alert>
          <Alert icon={<InfoOutlined color="secondary" sx={{ fontSize: 22 }} />} severity="info" sx={{ alignItems: 'center', bgcolor: 'secondary.lighter', color: 'secondary.dark' }}>
            <b>Payment Gateway:</b> All payments are securely processed via <b>Paystack</b>. We support debit/credit cards, bank transfers, and USSD.
          </Alert>
          <Alert icon={<InfoOutlined color="warning" sx={{ fontSize: 22 }} />} severity="info" sx={{ alignItems: 'center', bgcolor: 'warning.lighter', color: 'warning.dark' }}>
            We never share your data with third parties. <b>Your payment is processed securely in real time.</b>
          </Alert>
        </Stack>
      </Box>
    </>
  );
}

export default Checkout;
