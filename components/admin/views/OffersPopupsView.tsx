import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { TagIcon } from '../../icons/TagIcon';
import { Offer } from '../../../types';
import { PencilIcon } from '../../icons/PencilIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import { EyeIcon } from '../../icons/EyeIcon';
import { API_URL } from '../../../utils/api';

const initialOfferFormData: Omit<Offer, 'id'> = {
  title: '',
  image: '',
  description: '',
  buttonText: '',
  link: '',
  startDate: '',
  endDate: '',
  status: 'Draft',
};

const OffersPopupsView: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<Omit<Offer, 'id'>>(initialOfferFormData);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an admin-only endpoint
        const res = await fetch(`${API_URL}/api/content/offers/all`); 
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        setOffers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, image: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Add API call to create/update offer
    if (editingOffer) {
      setOffers(offers.map(offer => offer.id === editingOffer.id ? { ...editingOffer, ...formData } : offer));
      alert('Offer updated successfully! (Mock)');
    } else {
      const newOffer: Offer = { id: `offer_${Date.now()}`, ...formData };
      setOffers([newOffer, ...offers]);
      alert('New offer created successfully! (Mock)');
    }
    setFormData(initialOfferFormData);
    setEditingOffer(null);
    setShowAddForm(false);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
        title: offer.title,
        image: offer.image,
        description: offer.description,
        buttonText: offer.buttonText,
        link: offer.link,
        startDate: offer.startDate.split('T')[0], // Format date for input
        endDate: offer.endDate.split('T')[0], // Format date for input
        status: offer.status
    });
    setShowAddForm(true);
  };

  const handleDelete = (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      // TODO: Add API call to delete offer
      setOffers(offers.filter(offer => offer.id !== offerId));
      alert('Offer deleted successfully. (Mock)');
    }
  };
  
  const handleToggleForm = () => {
      setShowAddForm(!showAddForm);
      setEditingOffer(null); 
      setFormData(initialOfferFormData); 
  };

  const statusOptions: { value: Offer['status'], label: string }[] = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Published', label: 'Published' },
  ];

  return (
    <div className="space-y-6 text-gray-100">
      <div className="flex items-center space-x-3">
        <TagIcon className="w-8 h-8 text-rose-400" />
        <h1 className="text-3xl font-bold">Offers & Popups Management</h1>
      </div>
      <p className="text-gray-300">
        Create, manage, and schedule promotional offers that can be displayed as popups to users.
      </p>

      <div className="flex justify-end">
        <Button onClick={handleToggleForm} variant="primary" className="!bg-green-600 hover:!bg-green-700">
          {showAddForm ? 'Cancel' : '+ Add New Popup Offer'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded-lg shadow-xl space-y-4">
          <h2 className="text-xl font-semibold text-gray-100 mb-2">{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
          <Input id="title" name="title" label="Offer Title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Monsoon Bonanza!" className="[&_label]:text-gray-400 [&_input]:bg-gray-600 [&_input]:text-white" required />
          <Input id="image" name="image" label="Image URL (or path)" value={formData.image} onChange={handleImageChange} placeholder="e.g., /assets/images/offer-banner.jpg or https://..." className="[&_label]:text-gray-400 [&_input]:bg-gray-600 [&_input]:text-white" required />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleInputChange} className="block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-2 text-white custom-scrollbar" placeholder="Offer details..." required></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="buttonText" name="buttonText" label="Button Text" value={formData.buttonText} onChange={handleInputChange} placeholder="e.g., Upgrade Now" className="[&_label]:text-gray-400 [&_input]:bg-gray-600 [&_input]:text-white" required />
            <Input id="link" name="link" label="Button Link URL" value={formData.link} onChange={handleInputChange} placeholder="e.g., /dashboard/membership" className="[&_label]:text-gray-400 [&_input]:bg-gray-600 [&_input]:text-white" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="date" id="startDate" name="startDate" label="Start Date" value={formData.startDate} onChange={handleInputChange} className="[&_label]:text-gray-400 [&_input]:bg-gray-600 [&_input]:text-white [&_input]:border-gray-500" required />
            <Input type="date" id="endDate" name="endDate" label="End Date" value={formData.endDate} onChange={handleInputChange} className="[&_label]:text-gray-400 [&_input]:bg-gray-600 [&_input]:text-white [&_input]:border-gray-500" required />
            <Select id="status" name="status" label="Status" options={statusOptions} value={formData.status} onChange={handleInputChange} className="[&_label]:text-gray-400 [&_select]:bg-gray-600 [&_select]:text-white [&_select]:border-gray-500" required />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="!bg-rose-500 hover:!bg-rose-600">
              {editingOffer ? 'Update Offer' : 'Save Offer'}
            </Button>
          </div>
        </form>
      )}

      {/* Offers Table */}
      <div className="bg-gray-700 shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-750">
            <tr>
              {['Title', 'Status', 'Date Range', 'Link', 'Actions'].map(header => (
                <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-700 divide-y divide-gray-600">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-400">Loading offers...</td></tr>
            ) : offers.map(offer => (
              <tr key={offer.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{offer.title}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    offer.status === 'Published' ? 'bg-green-700 text-green-100' : 'bg-gray-500 text-gray-100'
                  }`}>{offer.status}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-rose-300">{offer.link}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button onClick={() => handleEdit(offer)} size="sm" variant="secondary" className="!text-xs !py-1 !px-2 !bg-blue-600 hover:!bg-blue-700 !text-white" title="Edit Offer"><PencilIcon className="w-4 h-4"/></Button>
                  <Button onClick={() => handleDelete(offer.id)} size="sm" variant="danger" className="!text-xs !py-1 !px-2 !bg-red-600 hover:!bg-red-700" title="Delete Offer"><TrashIcon className="w-4 h-4"/></Button>
                  <Button onClick={() => alert("Previewing popup (mock).")} size="sm" variant="secondary" className="!text-xs !py-1 !px-2 !bg-gray-500 hover:!bg-gray-400" title="Preview Popup"><EyeIcon className="w-4 h-4"/></Button>
                </td>
              </tr>
            ))}
            {!isLoading && offers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-gray-400">No offers created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersPopupsView;