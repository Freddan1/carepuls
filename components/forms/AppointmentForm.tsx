"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import CustomFormField, { FormFieldType } from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { getAppointmentSchema } from "@/lib/validation"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SelectItem } from "../ui/select"
import { Doctors } from "@/constants"
import { createAppointment } from "@/lib/actions/appointment.actions"

const AppointmentForm =({userId, patientId, type}: {userId: string, patientId: string, type: "create" | "cancel" | "schedule"}) => {
  const router = useRouter();  
  const [isLoading, setIsLoading] = useState(false)

  const AppointmentFormValidaion = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidaion>>({
  resolver: zodResolver(AppointmentFormValidaion),
    defaultValues: {
      primaryPhysician: "",
      schedule: new Date(),
      reason: "",
      note: "",
      cancellationReason: "",
    },
  })
 
 const onSubmit = async (values: z.infer<typeof AppointmentFormValidaion>) => {
    setIsLoading(true);

    let status;

    switch (type) {
        case 'schedule':
            status = "scheduled"
            break;
        case 'cancel':
            status = 'cancelled'
        default:
            status = 'pending'    
            break;
    }

    try {
        if (type === "create" && patientId) {
            const appointment = {
              userId,
              patient: patientId,
              primaryPhysician: values.primaryPhysician,
              schedule: new Date(values.schedule),
              reason: values.reason!,
              status: status as Status,
              note: values.note,
            };
    
            const newAppointment = await createAppointment(appointment);

            if (newAppointment) {
                form.reset();
                router.push(`/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`)
            }
      }

    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  let buttonLabel;

  switch (type) {
    case "cancel":
        buttonLabel = "Cancel Appointment"    
        break;
    case "create":
        buttonLabel = "Create Appointment"
        break;
    case "schedule":
        buttonLabel = "Schedule Appointment"    
    default:
        break;
  }

  return(
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
            <h1 className="header">New appointment</h1>
            <p className="text-dark-700">Request a new appointment in 10 seconds</p>
        </section>

        {type !== "cancel" && (
            <>
                <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="primaryPhysician"
                    label="Doctor"
                    placeholder="Select a Doctor"
                    >
                    {Doctors.map((doctor) => (
                        <SelectItem key={doctor.name} value={doctor.name}>
                            <div className="flex cursor-pointer items-center gap-2">
                                <Image
                                    src={doctor.image}
                                    width={32}
                                    height={32}
                                    alt={doctor.name}
                                    className="rounded-full border border-dark-500"
                                />
                                <p>
                                    {doctor.name}
                                </p>
                            </div>
                        </SelectItem>
                    ))}
                </CustomFormField>

                <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="schedule"
                label="Expected appointment date"
                showTimeSelect
                dateFormat="dd/MM/yyyy - h:mm aa"
                />

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="reason"
                        label="Reason for appointment"
                        placeholder="Enter a reason for appointment"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="note"
                        label="Note"
                        placeholder="Enter notes"
                    />
                </div>        
            </>
        )}

        {type === "cancel" && (
            <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="cancelationReason"
                label="Reason for cancellation"
                placeholder="Enter reason for cancellation"
            />
        )}

        <SubmitButton isLoading={isLoading} className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}>
            {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  )
}

export default AppointmentForm