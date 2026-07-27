import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import TextareaField from '../common/TextareaField';
import Button from '../common/Button';
import { tripSchema } from '../../utils/validationSchemas';
import { destinationApi } from '../../api/destinationApi';
import { tripApi } from '../../api/tripApi';

/**
 * Handles both create and edit. Pass `trip` to edit an existing trip.
 */
export default function TripFormModal({ trip, onClose, onSaved }) {
  const [destinations, setDestinations] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: trip
      ? {
          title: trip.title,
          destinationId: String(trip.destination.id),
          startDate: trip.startDate,
          endDate: trip.endDate,
          totalBudget: trip.totalBudget != null ? String(trip.totalBudget) : '',
          notes: trip.notes || ''
        }
      : { title: '', destinationId: '', startDate: '', endDate: '', totalBudget: '', notes: '' }
  });

  useEffect(() => {
    destinationApi
      .search({ size: 100 })
      .then(({ data }) => setDestinations(data.data.content))
      .catch(() => toast.error('Could not load destinations'));
  }, []);

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      destinationId: Number(values.destinationId),
      startDate: values.startDate,
      endDate: values.endDate,
      totalBudget: values.totalBudget ? Number(values.totalBudget) : null,
      notes: values.notes || null,
      shared: trip?.shared || false
    };

    try {
      if (trip) {
        const { data } = await tripApi.update(trip.id, payload);
        toast.success('Trip updated');
        onSaved(data.data);
      } else {
        const { data } = await tripApi.create(payload);
        toast.success('Trip created');
        onSaved(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={trip ? 'Edit trip' : 'Plan a new trip'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Trip title"
          placeholder="e.g. Autumn in Kyoto"
          error={errors.title?.message}
          {...register('title')}
        />

        <SelectField label="Destination" error={errors.destinationId?.message} {...register('destinationId')}>
          <option value="">Select a destination</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
              {d.country ? ` — ${d.country}` : ''}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Start date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <FormField label="End date" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>

        <FormField
          label="Total budget (optional)"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 2500"
          error={errors.totalBudget?.message}
          {...register('totalBudget')}
        />

        <TextareaField label="Notes (optional)" error={errors.notes?.message} {...register('notes')} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {trip ? 'Save changes' : 'Create trip'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
