import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import TextareaField from '../common/TextareaField';
import Button from '../common/Button';
import { activitySchema } from '../../utils/validationSchemas';
import { activityApi } from '../../api/activityApi';

const ACTIVITY_TYPES = [
  'SIGHTSEEING',
  'TRANSPORTATION',
  'ACCOMMODATION',
  'DINING',
  'ADVENTURE',
  'SHOPPING',
  'OTHER'
];

export default function ActivityFormModal({ tripId, dayId, activity, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          title: activity.title,
          activityType: activity.activityType,
          startTime: activity.startTime || '',
          endTime: activity.endTime || '',
          location: activity.location || '',
          estimatedCost: activity.estimatedCost != null ? String(activity.estimatedCost) : '',
          notes: activity.notes || '',
          reminderEnabled: activity.reminderEnabled || false
        }
      : {
          title: '',
          activityType: 'SIGHTSEEING',
          startTime: '',
          endTime: '',
          location: '',
          estimatedCost: '',
          notes: '',
          reminderEnabled: false
        }
  });

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      activityType: values.activityType,
      startTime: values.startTime || null,
      endTime: values.endTime || null,
      location: values.location || null,
      estimatedCost: values.estimatedCost ? Number(values.estimatedCost) : null,
      notes: values.notes || null,
      reminderEnabled: Boolean(values.reminderEnabled)
    };

    try {
      if (activity) {
        const { data } = await activityApi.update(tripId, dayId, activity.id, payload);
        toast.success('Activity updated');
        onSaved(data.data);
      } else {
        const { data } = await activityApi.create(tripId, dayId, payload);
        toast.success('Activity scheduled');
        onSaved(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal title={activity ? 'Edit activity' : 'Schedule an activity'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Activity title"
          placeholder="e.g. Fushimi Inari hike"
          error={errors.title?.message}
          {...register('title')}
        />

        <SelectField label="Type" error={errors.activityType?.message} {...register('activityType')}>
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start time" type="time" error={errors.startTime?.message} {...register('startTime')} />
          <FormField label="End time" type="time" error={errors.endTime?.message} {...register('endTime')} />
        </div>

        <FormField
          label="Location (optional)"
          placeholder="e.g. Fushimi Inari Taisha"
          error={errors.location?.message}
          {...register('location')}
        />

        <FormField
          label="Estimated cost (optional)"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 25"
          error={errors.estimatedCost?.message}
          {...register('estimatedCost')}
        />

        <TextareaField label="Notes (optional)" error={errors.notes?.message} {...register('notes')} />

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" className="h-4 w-4 rounded border-voyage-100" {...register('reminderEnabled')} />
          Remind me before this activity
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {activity ? 'Save changes' : 'Add activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
