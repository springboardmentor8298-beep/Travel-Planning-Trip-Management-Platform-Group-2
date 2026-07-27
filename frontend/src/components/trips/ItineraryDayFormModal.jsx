import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import TextareaField from '../common/TextareaField';
import Button from '../common/Button';
import { itineraryDaySchema } from '../../utils/validationSchemas';
import { itineraryApi } from '../../api/itineraryApi';

export default function ItineraryDayFormModal({ tripId, day, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(itineraryDaySchema),
    defaultValues: day
      ? { date: day.date, title: day.title || '', notes: day.notes || '' }
      : { date: '', title: '', notes: '' }
  });

  const onSubmit = async (values) => {
    const payload = { date: values.date, title: values.title || null, notes: values.notes || null };
    try {
      if (day) {
        const { data } = await itineraryApi.updateDay(tripId, day.id, payload);
        toast.success('Day updated');
        onSaved(data.data);
      } else {
        const { data } = await itineraryApi.addDay(tripId, payload);
        toast.success('Day added');
        onSaved(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={day ? 'Edit itinerary day' : 'Add an itinerary day'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Date" type="date" error={errors.date?.message} {...register('date')} />
        <FormField
          label="Day title (optional)"
          placeholder="e.g. Arrival & old town"
          error={errors.title?.message}
          {...register('title')}
        />
        <TextareaField label="Notes (optional)" error={errors.notes?.message} {...register('notes')} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {day ? 'Save changes' : 'Add day'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
