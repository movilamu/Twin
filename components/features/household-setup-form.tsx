"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AVAILABLE_REGIONS } from "@/lib/hazard-data";
import type { HouseholdProfile, MobilityNeed } from "@/types/household";

const formSchema = z.object({
  address: z.string().min(3, "Enter a street address or neighborhood."),
  region: z.string().min(1, "Select the closest region type."),
  adults: z.coerce.number().int().min(0).max(20),
  children: z.coerce.number().int().min(0).max(20),
  elderly: z.coerce.number().int().min(0).max(20),
  pets: z.coerce.number().int().min(0).max(20),
  mobilityNeeds: z.array(
    z.enum(["none", "wheelchair", "limited-mobility", "visual", "hearing"])
  ),
  floorLevel: z.enum(["ground", "upper", "multi-story"]),
  buildingType: z.enum(["apartment", "detached-house", "townhouse"]),
  hasMedicalEquipment: z.boolean(),
  medicalEquipmentFloor: z.enum(["ground", "upper"]).nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MOBILITY_OPTIONS: { value: MobilityNeed; label: string }[] = [
  { value: "wheelchair", label: "Wheelchair user" },
  { value: "limited-mobility", label: "Limited mobility" },
  { value: "visual", label: "Visually impaired" },
  { value: "hearing", label: "Hearing impaired" },
];

const REGION_LABELS: Record<string, string> = {
  "coastal-lowland": "Coastal / lowland",
  "river-basin": "Near a river or basin",
  "urban-inland": "Urban, inland",
  "seismic-fault-zone": "Known seismic fault zone",
};

interface HouseholdSetupFormProps {
  isSaving: boolean;
  onSubmit: (profile: HouseholdProfile) => void;
}

/**
 * Collects the household details the resilience model needs.
 * Deliberately short — this is the "60 seconds" step promised on
 * the landing page, so every field must earn its place.
 */
export function HouseholdSetupForm({
  isSaving,
  onSubmit,
}: HouseholdSetupFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      region: "urban-inland",
      adults: 1,
      children: 0,
      elderly: 0,
      pets: 0,
      mobilityNeeds: [],
      floorLevel: "ground",
      buildingType: "apartment",
      hasMedicalEquipment: false,
      medicalEquipmentFloor: null,
    },
  });

  const watchedHasEquipment = watch("hasMedicalEquipment");

  function submit(values: FormValues): void {
    const profile: HouseholdProfile = {
      address: values.address,
      region: values.region,
      composition: {
        adults: values.adults,
        children: values.children,
        elderly: values.elderly,
        pets: values.pets,
        mobilityNeeds: values.mobilityNeeds,
      },
      home: {
        floorLevel: values.floorLevel,
        buildingType: values.buildingType,
        hasMedicalEquipment: values.hasMedicalEquipment,
        medicalEquipmentFloor: values.hasMedicalEquipment
          ? values.medicalEquipmentFloor ?? "ground"
          : null,
      },
    };
    onSubmit(profile);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about your household</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Used only to generate your resilience score. Takes about a minute.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Address or neighborhood</Label>
            <Input
              id="address"
              placeholder="e.g. 12 Marina Rd, Chennai"
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
              {...register("address")}
            />
            {errors.address && (
              <p id="address-error" className="text-xs text-danger">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Which best describes your area?</Label>
            <Select id="region" {...register("region")}>
              {AVAILABLE_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {REGION_LABELS[region] ?? region}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Adults</Label>
              <Input id="adults" type="number" min={0} {...register("adults")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input id="children" type="number" min={0} {...register("children")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elderly">Elderly</Label>
              <Input id="elderly" type="number" min={0} {...register("elderly")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pets">Pets</Label>
              <Input id="pets" type="number" min={0} {...register("pets")} />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              Any mobility or accessibility needs in the household?
            </legend>
            <Controller
              name="mobilityNeeds"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {MOBILITY_OPTIONS.map((option) => {
                    const checked = field.value.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors duration-200 ${
                          checked
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted hover:bg-foreground/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            field.onChange(
                              checked
                                ? field.value.filter((v) => v !== option.value)
                                : [...field.value, option.value]
                            );
                          }}
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="floorLevel">Which floor do you mainly live on?</Label>
              <Select id="floorLevel" {...register("floorLevel")}>
                <option value="ground">Ground floor</option>
                <option value="upper">Upper floor</option>
                <option value="multi-story">Multiple floors</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingType">Building type</Label>
              <Select id="buildingType" {...register("buildingType")}>
                <option value="apartment">Apartment</option>
                <option value="detached-house">Detached house</option>
                <option value="townhouse">Townhouse</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                {...register("hasMedicalEquipment")}
              />
              Household relies on medical equipment (e.g. oxygen, dialysis, refrigerated meds)
            </label>

            {watchedHasEquipment && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="medicalEquipmentFloor">Which floor is it on?</Label>
                <Select id="medicalEquipmentFloor" {...register("medicalEquipmentFloor")}>
                  <option value="ground">Ground floor</option>
                  <option value="upper">Upper floor</option>
                </Select>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? "Saving..." : "Generate my resilience score"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
