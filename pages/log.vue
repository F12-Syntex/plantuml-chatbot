<template>
  <div class="max-h-screen bg-gradient-to-br from-base-100 to-base-200 overflow-x-hidden overflow-y-auto">
    <div class="container mx-auto px-4 py-8 max-w-7xl w-full">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 class="text-4xl font-bold">Chat Logs</h1>
        </div>
        <p class="text-base-content/70 ml-11">Monitor all chats and their access logs</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div class="stat bg-base-200 rounded-lg shadow overflow-hidden">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div class="stat-title text-xs">Total Chats</div>
            <div class="stat-value text-primary text-2xl lg:text-3xl">{{ chats.length }}</div>
            <div class="stat-desc text-xs">All time</div>
          </div>

          <div class="stat bg-base-200 rounded-lg shadow overflow-hidden">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="stat-title text-xs">Total Messages</div>
            <div class="stat-value text-secondary text-2xl lg:text-3xl">{{ totalMessages }}</div>
            <div class="stat-desc text-xs">Across all chats</div>
          </div>

          <div class="stat bg-base-200 rounded-lg shadow overflow-hidden">
            <div class="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title text-xs">Recent Activity</div>
            <div class="stat-value text-accent text-2xl lg:text-3xl">{{ recentChats }}</div>
            <div class="stat-desc text-xs">Last 24 hours</div>
          </div>

          <div class="stat bg-base-200 rounded-lg shadow overflow-hidden">
            <div class="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title text-xs">Active Today</div>
            <div class="stat-value text-info text-2xl lg:text-3xl">{{ activeToday }}</div>
            <div class="stat-desc text-xs">Updated today</div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <div class="flex flex-col md:flex-row gap-4 items-center">
              <div class="form-control flex-1 w-full">
                <label class="label">
                  <span class="label-text">Search Chats</span>
                </label>
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by chat ID..."
                    class="input input-bordered w-full pl-10"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Items per page</span>
                </label>
                <select v-model="itemsPerPage" class="select select-bordered">
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat List -->
        <div v-if="filteredChats.length === 0" class="card bg-base-200 shadow-lg">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-base-content/70 text-lg">No chats found</p>
            <p class="text-base-content/50 text-sm mt-2" v-if="searchQuery">Try adjusting your search query</p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <!-- Chat Cards -->
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="chat in paginatedChats"
              :key="chat.id"
              class="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div class="card-body">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="avatar placeholder">
                        <div class="bg-primary text-primary-content rounded-full w-12">
                          <span class="text-lg font-bold">{{ chat.messageCount }}</span>
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <h2 class="card-title break-words">
                          <code class="text-sm font-mono break-all">{{ chat.id }}</code>
                        </h2>
                        <div class="flex flex-wrap gap-2 mt-2">
                          <div class="badge badge-primary badge-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {{ chat.messageCount }} messages
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2 md:gap-4 mt-4 text-xs md:text-sm text-base-content/70">
                      <div class="flex items-center gap-2 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="truncate">Created: {{ formatDate(chat.createdAt) }}</span>
                      </div>
                      <div class="flex items-center gap-2 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span class="truncate">Updated: {{ formatDate(chat.updatedAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-actions flex-col md:flex-row gap-2">
                    <button 
                      @click="viewLogs(chat.id)"
                      class="btn btn-primary btn-sm gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Logs
                    </button>
                    <a 
                      :href="`/chat/${chat.id}`"
                      target="_blank"
                      class="btn btn-outline btn-sm gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Chat
                    </a>
                    <button 
                      @click="confirmDelete(chat.id)"
                      class="btn btn-error btn-sm gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center w-full overflow-x-auto pb-2">
            <div class="join flex-wrap justify-center">
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === 1 }"
                @click="currentPage = 1"
              >
                ««
              </button>
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === 1 }"
                @click="currentPage--"
              >
                «
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                class="join-item btn btn-sm"
                :class="{ 'btn-active': page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === totalPages }"
                @click="currentPage++"
              >
                »
              </button>
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === totalPages }"
                @click="currentPage = totalPages"
              >
                »»
              </button>
            </div>
          </div>

          <!-- Page Info -->
          <div class="text-center text-sm text-base-content/70">
            Showing {{ startItem }}-{{ endItem }} of {{ filteredChats.length }} chats
          </div>
        </div>
      </div>

      <!-- Modal for viewing logs -->
      <dialog ref="modal" class="modal">
        <div class="modal-box max-w-[95vw] lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col w-full">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-2xl mb-2">Access Logs</h3>
              <p class="text-sm text-base-content/70 break-words">
                Chat ID: <code class="text-xs font-mono bg-base-300 px-2 py-1 rounded break-all">{{ selectedChatId }}</code>
              </p>
            </div>
            <button class="btn btn-sm btn-circle btn-ghost" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="loadingLogs" class="flex justify-center items-center py-12 flex-1">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
          
          <div v-else-if="accessLogs.length === 0" class="flex flex-col items-center justify-center py-12 flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-base-content/70 text-lg">No access logs found</p>
          </div>
          
          <div v-else class="flex-1 overflow-hidden flex flex-col">
            <!-- Pagination Controls -->
            <div class="flex items-center justify-between mb-4 pb-2 border-b">
              <div class="text-sm text-base-content/70">
                Showing {{ startLogItem }}-{{ endLogItem }} of {{ accessLogs.length }} logs
              </div>
              <div class="join">
                <button
                  class="join-item btn btn-sm"
                  :class="{ 'btn-disabled': currentLogPage === 1 }"
                  @click="currentLogPage = 1"
                >
                  ««
                </button>
                <button
                  class="join-item btn btn-sm"
                  :class="{ 'btn-disabled': currentLogPage === 1 }"
                  @click="currentLogPage--"
                >
                  «
                </button>
                <button
                  v-for="page in visibleLogPages"
                  :key="page"
                  class="join-item btn btn-sm"
                  :class="{ 'btn-active': page === currentLogPage }"
                  @click="currentLogPage = page"
                >
                  {{ page }}
                </button>
                <button
                  class="join-item btn btn-sm"
                  :class="{ 'btn-disabled': currentLogPage === totalLogPages }"
                  @click="currentLogPage++"
                >
                  »
                </button>
                <button
                  class="join-item btn btn-sm"
                  :class="{ 'btn-disabled': currentLogPage === totalLogPages }"
                  @click="currentLogPage = totalLogPages"
                >
                  »»
                </button>
              </div>
            </div>

            <!-- Delete All Button -->
            <!-- Delete All Button and Items per page -->
            <div class="mb-4 flex justify-between items-center gap-2">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-xs">Logs per page</span>
                </label>
                <select v-model="logsPerPage" class="select select-bordered select-sm">
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                  <option :value="4">4</option>
                  <option :value="5">5</option>
                </select>
              </div>
              <button
                @click="confirmDeleteAllLogs"
                class="btn btn-error btn-sm gap-2"
                :disabled="accessLogs.length === 0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete All Logs
              </button>
            </div>

            <!-- Logs List (Scrollable) -->
            <div class="flex-1 overflow-auto">
              <div class="space-y-3">
                <div
                  v-for="(log, index) in paginatedAccessLogs"
                  :key="`${log.timestamp}-${index}`"
                  class="card bg-base-100 shadow-md"
                >
                  <div class="card-body p-4">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex items-center gap-4 flex-1">
                      <div class="avatar placeholder">
                        <div class="rounded-full w-12" :class="{
                          'bg-success text-success-content': log.action === 'created',
                          'bg-info text-info-content': log.action === 'viewed',
                          'bg-warning text-warning-content': log.action === 'updated',
                          'bg-error text-error-content': log.action === 'deleted'
                        }">
                          <span class="text-lg font-bold">{{ log.action.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <span class="badge badge-lg" :class="{
                            'badge-success': log.action === 'created',
                            'badge-info': log.action === 'viewed',
                            'badge-warning': log.action === 'updated',
                            'badge-error': log.action === 'deleted'
                          }">
                            {{ log.action }}
                          </span>
                          <span class="text-sm text-base-content/70">{{ formatDate(log.timestamp) }}</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div class="min-w-0">
                            <div class="text-xs text-base-content/50 mb-1">IP Address</div>
                            <code class="text-xs font-mono bg-base-200 px-2 py-1 rounded break-all">{{ log.ip || 'N/A' }}</code>
                          </div>
                          <div class="min-w-0" v-if="log.country">
                            <div class="text-xs text-base-content/50 mb-1">Location</div>
                            <div class="badge badge-ghost break-words">
                              <span v-if="log.city">{{ log.city }}, </span>
                              {{ log.country }}
                            </div>
                          </div>
                          <div class="min-w-0" v-if="log.region">
                            <div class="text-xs text-base-content/50 mb-1">Region</div>
                            <div class="badge badge-ghost break-words">{{ log.region }}</div>
                          </div>
                          <div class="min-w-0">
                            <div class="text-xs text-base-content/50 mb-1">Device</div>
                            <div class="badge badge-ghost break-words">{{ log.device || 'N/A' }}</div>
                          </div>
                          <div class="min-w-0">
                            <div class="text-xs text-base-content/50 mb-1">Browser</div>
                            <div class="badge badge-ghost break-words">
                              {{ log.browser || 'N/A' }}
                              <span v-if="log.browserVersion"> v{{ log.browserVersion }}</span>
                            </div>
                          </div>
                          <div class="min-w-0">
                            <div class="text-xs text-base-content/50 mb-1">OS</div>
                            <div class="badge badge-outline break-words">{{ log.os || 'N/A' }}</div>
                          </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-3" v-if="log.language || log.referrer || log.sessionId || log.isBot">
                          <div class="min-w-0" v-if="log.language">
                            <div class="text-xs text-base-content/50 mb-1">Language</div>
                            <div class="badge badge-ghost">{{ log.language }}</div>
                          </div>
                          <div class="min-w-0" v-if="log.sessionId">
                            <div class="text-xs text-base-content/50 mb-1">Session ID</div>
                            <code class="text-xs font-mono bg-base-200 px-2 py-1 rounded break-all">{{ log.sessionId }}</code>
                          </div>
                          <div class="min-w-0" v-if="log.referrer">
                            <div class="text-xs text-base-content/50 mb-1">Referrer</div>
                            <a :href="log.referrer" target="_blank" class="text-xs text-primary hover:underline break-all">
                              {{ log.referrer.length > 50 ? log.referrer.substring(0, 50) + '...' : log.referrer }}
                            </a>
                          </div>
                          <div class="min-w-0" v-if="log.isBot !== undefined">
                            <div class="text-xs text-base-content/50 mb-1">Bot</div>
                            <div class="badge" :class="log.isBot ? 'badge-warning' : 'badge-success'">
                              {{ log.isBot ? 'Yes' : 'No' }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Delete Log Button -->
                    <div class="flex items-center">
                      <button
                        @click="confirmDeleteLog(log.timestamp, index)"
                        class="btn btn-error btn-xs gap-1"
                        title="Delete this log entry"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-action mt-6 border-t pt-4">
            <button class="btn btn-primary" @click="closeModal">Close</button>
          </div>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="closeModal">close</button>
        </form>
      </dialog>

      <!-- Delete Confirmation Modal -->
      <dialog ref="deleteModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Delete Chat</h3>
          <p class="py-4">
            Are you sure you want to delete chat <code class="bg-base-300 px-2 py-1 rounded">{{ chatToDelete }}</code>?
            This action cannot be undone and will also delete all access logs for this chat.
          </p>
          <div class="modal-action">
            <button class="btn btn-ghost" @click="cancelDelete" :disabled="deleting">Cancel</button>
            <button class="btn btn-error" @click="deleteChat" :disabled="deleting">
              <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="cancelDelete">close</button>
        </form>
      </dialog>

      <!-- Delete Log Modal -->
      <dialog ref="deleteLogModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Delete Log Entry</h3>
          <p class="py-4">
            Are you sure you want to delete this log entry from <code class="bg-base-300 px-2 py-1 rounded">{{ logToDelete ? formatDate(logToDelete.timestamp) : '' }}</code>?
            This action cannot be undone.
          </p>
          <div class="modal-action">
            <button class="btn btn-ghost" @click="cancelDeleteLog" :disabled="deletingLog">Cancel</button>
            <button class="btn btn-error" @click="deleteLog" :disabled="deletingLog">
              <span v-if="deletingLog" class="loading loading-spinner loading-sm"></span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="cancelDeleteLog">close</button>
        </form>
      </dialog>

      <!-- Delete All Logs Modal -->
      <dialog ref="deleteAllLogsModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Delete All Logs</h3>
          <p class="py-4">
            Are you sure you want to delete all <strong>{{ accessLogs.length }}</strong> log entries for chat <code class="bg-base-300 px-2 py-1 rounded">{{ selectedChatId }}</code>?
            This action cannot be undone.
          </p>
          <div class="modal-action">
            <button class="btn btn-ghost" @click="cancelDeleteAllLogs" :disabled="deletingAllLogs">Cancel</button>
            <button class="btn btn-error" @click="deleteAllLogs" :disabled="deletingAllLogs">
              <span v-if="deletingAllLogs" class="loading loading-spinner loading-sm"></span>
              <span v-else>Delete All</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="cancelDeleteAllLogs">close</button>
        </form>
      </dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Chat {
  id: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface AccessLog {
  timestamp: string
  action: 'created' | 'viewed' | 'updated' | 'deleted'
  ip?: string
  region?: string
  country?: string
  city?: string
  userAgent?: string
  device?: string
  browser?: string
  browserVersion?: string
  os?: string
  referrer?: string
  url?: string
  method?: string
  language?: string
  timezone?: string
  isBot?: boolean
  sessionId?: string
}

const chats = ref<Chat[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Search and pagination
const searchQuery = ref('')
const itemsPerPage = ref(20)
const currentPage = ref(1)

const modal = ref<HTMLDialogElement | null>(null)
const deleteModal = ref<HTMLDialogElement | null>(null)
const deleteLogModal = ref<HTMLDialogElement | null>(null)
const deleteAllLogsModal = ref<HTMLDialogElement | null>(null)
const selectedChatId = ref<string | null>(null)
const chatToDelete = ref<string | null>(null)
const logToDelete = ref<{ timestamp: string; index: number } | null>(null)
const accessLogs = ref<AccessLog[]>([])
const loadingLogs = ref(false)
const deleting = ref(false)
const deletingLog = ref(false)
const deletingAllLogs = ref(false)

// Log pagination
const logsPerPage = ref(5)
const currentLogPage = ref(1)

// Computed properties
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return chats.value
  }
  const query = searchQuery.value.toLowerCase()
  return chats.value.filter(chat => 
    chat.id.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredChats.value.length / itemsPerPage.value)
})

const paginatedChats = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredChats.value.slice(start, end)
})

const startItem = computed(() => {
  return filteredChats.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredChats.value.length)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Log pagination computed
const totalLogPages = computed(() => {
  return Math.ceil(accessLogs.value.length / logsPerPage.value)
})

const paginatedAccessLogs = computed(() => {
  const start = (currentLogPage.value - 1) * logsPerPage.value
  const end = start + logsPerPage.value
  return accessLogs.value.slice(start, end)
})

const startLogItem = computed(() => {
  return accessLogs.value.length === 0 ? 0 : (currentLogPage.value - 1) * logsPerPage.value + 1
})

const endLogItem = computed(() => {
  return Math.min(currentLogPage.value * logsPerPage.value, accessLogs.value.length)
})

const visibleLogPages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentLogPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalLogPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Statistics
const totalMessages = computed(() => {
  return chats.value.reduce((sum, chat) => sum + chat.messageCount, 0)
})

const recentChats = computed(() => {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  return chats.value.filter(chat => {
    const updated = new Date(chat.updatedAt)
    return updated >= yesterday
  }).length
})

const activeToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return chats.value.filter(chat => {
    const updated = new Date(chat.updatedAt)
    updated.setHours(0, 0, 0, 0)
    return updated.getTime() === today.getTime()
  }).length
})

onMounted(async () => {
  await loadChats()
})

// Reset to first page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

watch(logsPerPage, () => {
  currentLogPage.value = 1
})

async function loadChats() {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch('/api/log/list')
    if (!response.ok) {
      throw new Error('Failed to load chats')
    }
    
    chats.value = await response.json()
  } catch (err: any) {
    error.value = err.message || 'Failed to load chats'
    console.error('Error loading chats:', err)
  } finally {
    loading.value = false
  }
}

async function viewLogs(chatId: string) {
  selectedChatId.value = chatId
  loadingLogs.value = true
  accessLogs.value = []
  
  if (modal.value) {
    modal.value.showModal()
  }
  
  try {
    const response = await fetch(`/api/log/${chatId}`)
    if (!response.ok) {
      throw new Error('Failed to load access logs')
    }
    
    const logs = await response.json()
    // Ensure we have an array
    if (Array.isArray(logs)) {
      accessLogs.value = logs
      // Sort by timestamp descending (most recent first)
      accessLogs.value.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      console.log(`Loaded ${accessLogs.value.length} access logs for chat ${chatId}`)
    } else {
      console.warn(`Invalid logs format for chat ${chatId}`)
      accessLogs.value = []
    }
  } catch (err: any) {
    console.error('Error loading access logs:', err)
  } finally {
    loadingLogs.value = false
  }
}

function closeModal() {
  if (modal.value) {
    modal.value.close()
  }
  selectedChatId.value = null
  accessLogs.value = []
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

async function confirmDelete(chatId: string) {
  chatToDelete.value = chatId
  if (deleteModal.value) {
    deleteModal.value.showModal()
  }
}

async function deleteChat() {
  if (!chatToDelete.value) return
  
  try {
    deleting.value = true
    const response = await fetch(`/api/log/${chatToDelete.value}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete chat')
    }
    
    // Remove from local list
    chats.value = chats.value.filter(chat => chat.id !== chatToDelete.value)
    
    // Close modal
    if (deleteModal.value) {
      deleteModal.value.close()
    }
    chatToDelete.value = null
    
    // Show success notification
    alert('Chat deleted successfully!')
    
    // Reload chats to refresh stats
    await loadChats()
  } catch (err: any) {
    console.error('Error deleting chat:', err)
    alert('Failed to delete chat: ' + (err.message || 'Unknown error'))
  } finally {
    deleting.value = false
  }
}

function cancelDelete() {
  if (deleteModal.value) {
    deleteModal.value.close()
  }
  chatToDelete.value = null
}

async function confirmDeleteLog(timestamp: string, index: number) {
  logToDelete.value = { timestamp, index }
  if (deleteLogModal.value) {
    deleteLogModal.value.showModal()
  }
}

async function deleteLog() {
  if (!logToDelete.value || !selectedChatId.value) return
  
  try {
    deletingLog.value = true
    const response = await fetch(`/api/log/${selectedChatId.value}/logs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: logToDelete.value.timestamp })
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete log')
    }
    
    // Remove from local array
    accessLogs.value = accessLogs.value.filter(log => log.timestamp !== logToDelete.value!.timestamp)
    
    // Adjust current page if needed
    if (currentLogPage.value > totalLogPages.value && totalLogPages.value > 0) {
      currentLogPage.value = totalLogPages.value
    }
    
    // Close modal
    if (deleteLogModal.value) {
      deleteLogModal.value.close()
    }
    logToDelete.value = null
  } catch (err: any) {
    console.error('Error deleting log:', err)
    alert('Failed to delete log: ' + (err.message || 'Unknown error'))
  } finally {
    deletingLog.value = false
  }
}

function cancelDeleteLog() {
  if (deleteLogModal.value) {
    deleteLogModal.value.close()
  }
  logToDelete.value = null
}

async function confirmDeleteAllLogs() {
  if (deleteAllLogsModal.value) {
    deleteAllLogsModal.value.showModal()
  }
}

async function deleteAllLogs() {
  if (!selectedChatId.value) return
  
  try {
    deletingAllLogs.value = true
    const response = await fetch(`/api/log/${selectedChatId.value}/logs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true })
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete all logs')
    }
    
    // Clear local array
    accessLogs.value = []
    currentLogPage.value = 1
    
    // Close modal
    if (deleteAllLogsModal.value) {
      deleteAllLogsModal.value.close()
    }
    
    alert('All logs deleted successfully!')
  } catch (err: any) {
    console.error('Error deleting all logs:', err)
    alert('Failed to delete all logs: ' + (err.message || 'Unknown error'))
  } finally {
    deletingAllLogs.value = false
  }
}

function cancelDeleteAllLogs() {
  if (deleteAllLogsModal.value) {
    deleteAllLogsModal.value.close()
  }
}

// Reset log pagination when logs change
watch(accessLogs, () => {
  if (accessLogs.value.length === 0) {
    currentLogPage.value = 1
  } else if (currentLogPage.value > totalLogPages.value) {
    currentLogPage.value = Math.max(1, totalLogPages.value)
  }
})
</script>

