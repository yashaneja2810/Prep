import { create } from 'zustand'
import { Organization } from '@/lib/api/organizations'

// Extended organization interface for UI display
export interface ExtendedOrganization extends Organization {
  // Additional UI-specific fields that might be computed
  formatted_address?: string
  formatted_type?: string
  total_employees?: number
  partner_since?: string
  partnership_level?: 'gold' | 'silver' | 'bronze' | 'basic'
}

// Form modes for organization management
export type FormMode = 'create' | 'edit' | 'view'

interface OrganizationsState {
  // Data
  organizations: Organization[]
  filteredOrganizations: Organization[]
  selectedOrganization: Organization | null
  
  // Filters
  searchTerm: string
  selectedType: string
  selectedIndustry: string
  selectedStatus: string
  activeTab: string
  
  // Form State
  formMode: FormMode
  isFormOpen: boolean
  formErrors: Record<string, string>
  editingOrganizationId: string | null
  isSubmitting: boolean
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Data Actions
  setOrganizations: (organizations: Organization[]) => void
  addOrganization: (organization: Organization) => void
  updateOrganization: (organizationId: string, updates: Partial<Organization>) => void
  removeOrganization: (organizationId: string) => void
  setSelectedOrganization: (organization: Organization | null) => void
  
  // Filter Actions
  setSearchTerm: (term: string) => void
  setSelectedType: (type: string) => void
  setSelectedIndustry: (industry: string) => void
  setSelectedStatus: (status: string) => void
  setActiveTab: (tab: string) => void
  filterOrganizations: () => void
  resetFilters: () => void
  
  // Form Actions
  setFormMode: (mode: FormMode) => void
  toggleForm: (open: boolean) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  setEditingOrganizationId: (organizationId: string | null) => void
  setSubmitting: (submitting: boolean) => void
  
  // Loading Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper Functions
  getOrganizationById: (organizationId: string) => Organization | null
  getActiveOrganizations: () => Organization[]
  getInactiveOrganizations: () => Organization[]
  getHiringOrganizations: () => Organization[]
  getTrainingOrganizations: () => Organization[]
}

export const useOrganizationsStore = create<OrganizationsState>((set, get) => ({
  // Initial state
  organizations: [],
  filteredOrganizations: [],
  selectedOrganization: null,
  searchTerm: "",
  selectedType: "all",
  selectedIndustry: "all",
  selectedStatus: "active",
  activeTab: "all",
  formMode: "create",
  isFormOpen: false,
  formErrors: {},
  editingOrganizationId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,

  // Data Actions
  setOrganizations: (organizations) => {
    // Ensure organizations is always an array
    const safeOrganizations = Array.isArray(organizations) ? organizations : []
    console.log('🟢 [ORG_STORE] setOrganizations called with', safeOrganizations.length, 'organizations')
    const currentOrganizations = get().organizations
    
    // Only update if data actually changed
    if (JSON.stringify(currentOrganizations) !== JSON.stringify(safeOrganizations)) {
      console.log('🟢 [ORG_STORE] Organizations data changed, updating state')
      set({ organizations: safeOrganizations })
      // Use setTimeout to prevent cascading updates
      setTimeout(() => {
        console.log('🟢 [ORG_STORE] Applying filters after state update')
        get().filterOrganizations()
      }, 0)
    } else {
      console.log('🟢 [ORG_STORE] Organizations data unchanged, skipping update')
    }
  },

  addOrganization: (organization) => {
    console.log('🟢 [ORG_STORE] addOrganization called for:', organization.id)
    const { organizations } = get()
    const safeOrganizations = Array.isArray(organizations) ? organizations : []
    const updatedOrganizations = [organization, ...safeOrganizations]
    set({ organizations: updatedOrganizations })
    get().filterOrganizations()
  },

  updateOrganization: (organizationId, updates) => {
    console.log('🟢 [ORG_STORE] updateOrganization called for:', organizationId)
    const { organizations } = get()
    const safeOrganizations = Array.isArray(organizations) ? organizations : []
    const updatedOrganizations = safeOrganizations.map(org =>
      org.id === organizationId ? { ...org, ...updates } : org
    )
    set({ organizations: updatedOrganizations })
    get().filterOrganizations()
    
    // Update selected organization if it's the one being updated
    const { selectedOrganization } = get()
    if (selectedOrganization && selectedOrganization.id === organizationId) {
      set({ selectedOrganization: { ...selectedOrganization, ...updates } })
    }
  },

  removeOrganization: (organizationId) => {
    console.log('🟢 [ORG_STORE] removeOrganization called for:', organizationId)
    const { organizations, selectedOrganization } = get()
    const safeOrganizations = Array.isArray(organizations) ? organizations : []
    const updatedOrganizations = safeOrganizations.filter(org => org.id !== organizationId)
    set({ organizations: updatedOrganizations })
    
    // Use setTimeout to prevent cascading updates
    setTimeout(() => {
      console.log('🟢 [ORG_STORE] Applying filters after organization removal')
      get().filterOrganizations()
    }, 0)
    
    // Clear selected organization if it's the one being removed
    if (selectedOrganization && selectedOrganization.id === organizationId) {
      set({ selectedOrganization: null })
    }
    
    // Clear editing organization if it's the one being removed
    const { editingOrganizationId } = get()
    if (editingOrganizationId === organizationId) {
      set({ editingOrganizationId: null })
    }
  },

  setSelectedOrganization: (selectedOrganization) => set({ selectedOrganization }),

  // Filter Actions
  setSearchTerm: (searchTerm) => {
    set({ searchTerm })
    get().filterOrganizations()
  },

  setSelectedType: (selectedType) => {
    set({ selectedType })
    get().filterOrganizations()
  },

  setSelectedIndustry: (selectedIndustry) => {
    set({ selectedIndustry })
    get().filterOrganizations()
  },

  setSelectedStatus: (selectedStatus) => {
    set({ selectedStatus })
    get().filterOrganizations()
  },

  setActiveTab: (activeTab) => {
    set({ activeTab })
    get().filterOrganizations()
  },

  filterOrganizations: () => {
    const { 
      organizations, 
      searchTerm, 
      selectedType, 
      selectedIndustry, 
      selectedStatus,
      activeTab 
    } = get()
    
    console.log('🟢 [ORG_STORE] Filtering organizations with filters:', {
      searchTerm,
      selectedType,
      selectedIndustry,
      selectedStatus,
      activeTab,
      total: organizations.length
    })
    
    let filtered = Array.isArray(organizations) ? [...organizations] : []
    
    // Filter by tab (recruitment status and type)
    if (activeTab === "recruiting") {
      filtered = filtered.filter(org => org.is_currently_hiring === true)
    } else if (activeTab === "not-recruiting") {
      filtered = filtered.filter(org => org.is_currently_hiring === false)
    } else if (activeTab === "training") {
      filtered = filtered.filter(org => org.type === "training")
    } else if (activeTab === "active") {
      filtered = filtered.filter(org => org.is_active === true)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter(org => org.is_active === false)
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(org => 
        (org.org_name && org.org_name.toLowerCase().includes(searchLower)) ||
        (org.code && org.code.toLowerCase().includes(searchLower)) ||
        (org.industry && org.industry.toLowerCase().includes(searchLower)) ||
        (org.website && org.website.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(org => org.type === selectedType)
    }
    
    // Filter by industry
    if (selectedIndustry !== "all") {
      filtered = filtered.filter(org => org.industry === selectedIndustry)
    }
    
    // Filter by status
    if (selectedStatus === "active") {
      filtered = filtered.filter(org => org.is_active === true)
    } else if (selectedStatus === "inactive") {
      filtered = filtered.filter(org => org.is_active === false)
    }
    // "all" shows both active and inactive
    
    console.log('🟢 [ORG_STORE] Filtered organizations:', filtered.length, 'of', organizations.length)
    set({ filteredOrganizations: filtered })
  },

  resetFilters: () => {
    console.log('🟢 [ORG_STORE] Resetting all filters')
    set({
      searchTerm: "",
      selectedType: "all",
      selectedIndustry: "all",
      selectedStatus: "active",
      activeTab: "all"
    })
    get().filterOrganizations()
  },

  // Form Actions
  setFormMode: (formMode) => set({ formMode }),

  toggleForm: (isFormOpen) => {
    console.log('🟢 [ORG_STORE] Toggle form:', isFormOpen)
    set({ isFormOpen })
    
    if (!isFormOpen) {
      // Clear form state when closing
      set({
        formErrors: {},
        editingOrganizationId: null,
        selectedOrganization: null,
        formMode: "create"
      })
    }
  },

  setFormErrors: (formErrors) => set({ formErrors }),

  clearFormErrors: () => set({ formErrors: {} }),

  setEditingOrganizationId: (editingOrganizationId) => {
    console.log('🟢 [ORG_STORE] Set editing organization ID:', editingOrganizationId)
    set({ editingOrganizationId })
    
    if (editingOrganizationId) {
      // Find and set the selected organization for editing
      const { organizations } = get()
      const organization = organizations.find(org => org.id === editingOrganizationId)
      if (organization) {
        set({ 
          selectedOrganization: organization,
          formMode: "edit"
        })
      }
    }
  },

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Loading Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Helper Functions
  getOrganizationById: (organizationId) => {
    const { organizations } = get()
    return organizations.find(org => org.id === organizationId) || null
  },

  getActiveOrganizations: () => {
    const { organizations } = get()
    return organizations.filter(org => org.is_active === true)
  },

  getInactiveOrganizations: () => {
    const { organizations } = get()
    return organizations.filter(org => org.is_active === false)
  },

  getHiringOrganizations: () => {
    const { organizations } = get()
    return organizations.filter(org => org.type === 'hiring')
  },

  getTrainingOrganizations: () => {
    const { organizations } = get()
    return organizations.filter(org => org.type === 'training')
  }
}))

// Export helper selectors for easy access
export const useFilteredOrganizations = () => useOrganizationsStore(state => state.filteredOrganizations)
export const useOrganizationsLoading = () => useOrganizationsStore(state => state.isLoading)
export const useOrganizationsError = () => useOrganizationsStore(state => state.error)
export const useSelectedOrganization = () => useOrganizationsStore(state => state.selectedOrganization)
export const useOrganizationsFormState = () => useOrganizationsStore(state => ({
  isFormOpen: state.isFormOpen,
  formMode: state.formMode,
  formErrors: state.formErrors,
  isSubmitting: state.isSubmitting,
  editingOrganizationId: state.editingOrganizationId
})) 